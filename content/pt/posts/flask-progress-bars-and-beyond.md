---
date: 2025-04-11T14:33:12.000Z
draft: true
title: 'Construindo Aplicativos Web Flask Interativos: Barras de Progresso e Além'
description: >-
  Um guia prático para implementar barras de progresso, atualizações em tempo
  real e outras funcionalidades interativas em suas aplicações web Flask.
url: ''
featured_image: >-
  https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-flask-progress-bars.png
categories:
  - tutorial
tags:
  - python
  - flask
  - web development
  - javascript
  - ajax
  - socketio
translation_source_hash: 2ee245d7492cee513ea5e72ec37ec08af4438f58a03ae17d0621b61e045ca893
---
Flask é um framework web Python leve e flexível, perfeito para tudo, desde APIs simples a aplicações web complexas. Embora seja minimalista por design, o Flask pode ser estendido para criar experiências web altamente interativas e modernas. Uma das funcionalidades mais solicitadas em aplicações web é a capacidade de mostrar o progresso para tarefas de longa duração - sejam uploads de arquivos, processamento de dados ou cálculos complexos.

Neste artigo, explorarei várias abordagens para implementar barras de progresso e outras funcionalidades interativas no Flask, desde soluções simples até implementações em tempo real mais avançadas.

## O Desafio da Barra de Progresso

Quando um usuário inicia uma operação demorada em seu aplicativo web, fornecer feedback visual é crucial para uma boa experiência do usuário. Sem ele, os usuários podem pensar que o aplicativo travou, levando à frustração e ao potencial abandono.

Aqui está o que abordaremos:

1. Indicadores de progresso simples com polling AJAX
2. Barras de progresso em tempo real com Flask-SocketIO
3. Filas de tarefas com Celery para processamento em segundo plano
4. Melhorando a UX com elementos interativos adicionais

Vamos começar com uma configuração básica do Flask e depois a aprimorar progressivamente.

## Configuração Básica: Uma Aplicação Flask

Primeiro, vamos criar uma estrutura de aplicação Flask simples:

```bash
mkdir flask-progress-app
cd flask-progress-app
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask
```

Agora, vamos criar um aplicativo Flask mínimo:

```python
# app.py
from flask import Flask, render_template, jsonify
import time
import random

app = Flask(__name__)

# Simulating a task with progress
task_progress = {}

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
```

Crie um template HTML básico:

```html
<!-- templates/index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Flask Progress Bar Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Flask Progress Bar Demo</h1>
        <div class="mt-4">
            <button id="start-task" class="btn btn-primary">Start Task</button>
        </div>
        <div class="mt-3" id="progress-container" style="display: none;">
            <div class="progress">
                <div id="progress-bar" class="progress-bar" role="progressbar" style="width: 0%"></div>
            </div>
            <p id="progress-text" class="mt-2">0% Complete</p>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // JavaScript will be added here
    </script>
</body>
</html>
```

## Abordagem 1: Polling AJAX para Atualizações de Progresso

Esta é a abordagem mais simples e funciona bem para a maioria dos casos de uso. Vamos adicionar funcionalidade para iniciar uma tarefa de longa duração e fazer polling para atualizações de progresso.

Primeiro, adicione estas rotas a `app.py`:

```python
import threading
import uuid

@app.route('/start-task')
def start_task():
    task_id = str(uuid.uuid4())
    task_progress[task_id] = {'progress': 0, 'status': 'in progress'}

    # Start the task in a background thread
    threading.Thread(target=long_running_task, args=(task_id,)).start()

    return jsonify({'task_id': task_id})

@app.route('/task-progress/<task_id>')
def task_progress_route(task_id):
    progress = task_progress.get(task_id, {})
    return jsonify(progress)

def long_running_task(task_id):
    """Simulate a long-running task with progress updates."""
    total_steps = 10
    for step in range(1, total_steps + 1):
        # Simulate work being done
        time.sleep(1)

        # Update progress
        progress = int(step * 100 / total_steps)
        task_progress[task_id]['progress'] = progress

        if step == total_steps:
            task_progress[task_id]['status'] = 'completed'
```

Agora, vamos adicionar o JavaScript para fazer polling para atualizações:

```javascript
$(document).ready(function() {
    $('#start-task').click(function() {
        // Show progress container
        $('#progress-container').show();

        // Reset progress bar
        updateProgressBar(0);

        // Start the task
        $.ajax({
            url: '/start-task',
            success: function(response) {
                pollProgress(response.task_id);
            }
        });
    });

    function pollProgress(taskId) {
        $.ajax({
            url: '/task-progress/' + taskId,
            success: function(response) {
                updateProgressBar(response.progress);

                if (response.status === 'completed') {
                    // Task completed
                    $('#progress-text').text('Task completed!');
                } else {
                    // Continue polling
                    setTimeout(function() {
                        pollProgress(taskId);
                    }, 500);
                }
            },
            error: function() {
                $('#progress-text').text('Error checking progress');
            }
        });
    }

    function updateProgressBar(progress) {
        $('#progress-bar').css('width', progress + '%');
        $('#progress-text').text(progress + '% Complete');
    }
});
```

Esta implementação funciona da seguinte forma:
1. Iniciando uma tarefa em um thread em segundo plano quando solicitado
2. Verificando periodicamente o progresso através de requisições AJAX
3. Atualizando a barra de progresso com base na resposta

Embora simples, esta abordagem tem limitações - aumenta a carga do servidor com polling frequente e não fornece atualizações verdadeiramente em tempo real.

## Abordagem 2: Progresso em Tempo Real com Flask-SocketIO

Para uma experiência mais responsiva, podemos usar WebSockets para enviar atualizações para o cliente em tempo real. Vamos implementar isso usando Flask-SocketIO:

```bash
pip install flask-socketio eventlet
```

Atualize `app.py`:

```python
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import time
import threading
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store active tasks
active_tasks = {}

@app.route('/')
def index():
    return render_template('socketio_index.html')

@socketio.on('start_task')
def handle_start_task():
    task_id = str(uuid.uuid4())
    active_tasks[task_id] = {'progress': 0}

    # Return task ID to client
    emit('task_started', {'task_id': task_id})

    # Start task in background
    threading.Thread(target=long_running_task_socketio, args=(task_id,)).start()

def long_running_task_socketio(task_id):
    """Simulate a long-running task with SocketIO progress updates."""
    total_steps = 10
    for step in range(1, total_steps + 1):
        # Simulate work being done
        time.sleep(1)

        # Calculate progress
        progress = int(step * 100 / total_steps)
        active_tasks[task_id]['progress'] = progress

        # Emit progress update to client
        socketio.emit('progress_update', {
            'task_id': task_id,
            'progress': progress,
            'status': 'completed' if step == total_steps else 'in_progress'
        })

if __name__ == '__main__':
    socketio.run(app, debug=True)
```

Crie um novo template para a versão SocketIO:

```html
<!-- templates/socketio_index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Flask SocketIO Progress Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Real-time Progress with Flask-SocketIO</h1>
        <div class="mt-4">
            <button id="start-task" class="btn btn-primary">Start Task</button>
        </div>
        <div class="mt-3" id="progress-container" style="display: none;">
            <div class="progress">
                <div id="progress-bar" class="progress-bar" role="progressbar" style="width: 0%"></div>
            </div>
            <p id="progress-text" class="mt-2">0% Complete</p>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>
    <script>
        $(document).ready(function() {
            // Connect to SocketIO server
            const socket = io();

            // Handle start task button click
            $('#start-task').click(function() {
                $('#progress-container').show();
                updateProgressBar(0);
                socket.emit('start_task');
            });

            // Listen for task started event
            socket.on('task_started', function(data) {
                console.log('Task started with ID:', data.task_id);
            });

            // Listen for progress updates
            socket.on('progress_update', function(data) {
                updateProgressBar(data.progress);

                if (data.status === 'completed') {
                    $('#progress-text').text('Task completed!');
                }
            });

            // Update progress bar UI
            function updateProgressBar(progress) {
                $('#progress-bar').css('width', progress + '%');
                $('#progress-text').text(progress + '% Complete');
            }
        });
    </script>
</body>
</html>
```

Com WebSockets, obtemos:
- Atualizações verdadeiramente em tempo real sem polling
- Carga reduzida do servidor em comparação com requisições AJAX constantes
- Uma experiência de usuário mais responsiva

## Abordagem 3: Tarefas em Segundo Plano com Celery e Rastreamento de Progresso

Para aplicações em produção com tarefas de longa duração, Celery é uma opção melhor. Ele fornece uma fila de tarefas robusta que pode lidar com cargas de trabalho distribuídas. Vamos configurá-lo com Redis como o message broker:

```bash
pip install flask celery redis
```

Veja como implementar barras de progresso com Celery:

```python
# celery_app.py
from flask import Flask, render_template, jsonify, request
from celery import Celery
import time

app = Flask(__name__)

# Configure Celery
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

celery = Celery(
    app.name,
    broker=app.config['CELERY_BROKER_URL'],
    backend=app.config['CELERY_RESULT_BACKEND']
)
celery.conf.update(app.config)

# Store task progress
task_progress = {}

@app.route('/')
def index():
    return render_template('celery_index.html')

@app.route('/start-task', methods=['POST'])
def start_celery_task():
    task = long_running_task.apply_async()
    return jsonify({'task_id': task.id})

@app.route('/task-status/<task_id>')
def task_status(task_id):
    task = long_running_task.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'progress': 0,
        }
    elif task.state == 'PROGRESS':
        response = {
            'state': task.state,
            'progress': task.info.get('progress', 0),
        }
    elif task.state == 'SUCCESS':
        response = {
            'state': task.state,
            'progress': 100,
            'result': task.result,
        }
    else:
        # Error or other states
        response = {
            'state': task.state,
            'progress': 0,
            'error': str(task.info),
        }
    return jsonify(response)

@celery.task(bind=True)
def long_running_task(self):
    """Task with progress updates."""
    total_steps = 10
    for step in range(1, total_steps + 1):
        # Simulate work
        time.sleep(1)

        # Update progress
        progress = int(step * 100 / total_steps)
        self.update_state(
            state='PROGRESS',
            meta={'progress': progress}
        )

    return {'status': 'Task completed!'}

if __name__ == '__main__':
    app.run(debug=True)
```

E o template HTML:

```html
<!-- templates/celery_index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Flask Celery Progress Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1>Background Tasks with Celery Progress</h1>
        <div class="mt-4">
            <button id="start-task" class="btn btn-primary">Start Background Task</button>
        </div>
        <div class="mt-3" id="progress-container" style="display: none;">
            <div class="progress">
                <div id="progress-bar" class="progress-bar" role="progressbar" style="width: 0%"></div>
            </div>
            <p id="progress-text" class="mt-2">0% Complete</p>
            <p id="status-text" class="mt-2"></p>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        $(document).ready(function() {
            $('#start-task').click(function() {
                // Show progress container
                $('#progress-container').show();
                $('#status-text').text('Starting task...');

                // Reset progress bar
                updateProgressBar(0);

                // Start the task
                $.ajax({
                    url: '/start-task',
                    method: 'POST',
                    success: function(response) {
                        trackProgress(response.task_id);
                    }
                });
            });

            function trackProgress(taskId) {
                $.ajax({
                    url: '/task-status/' + taskId,
                    success: function(response) {
                        updateProgressBar(response.progress);

                        if (response.state === 'SUCCESS') {
                            $('#status-text').text(response.result.status);
                        } else if (response.state === 'PROGRESS') {
                            $('#status-text').text('Processing...');
                            setTimeout(function() {
                                trackProgress(taskId);
                            }, 500);
                        } else if (response.state === 'FAILURE') {
                            $('#status-text').text('Error: ' + response.error);
                        } else {
                            $('#status-text').text('Status: ' + response.state);
                            setTimeout(function() {
                                trackProgress(taskId);
                            }, 500);
                        }
                    },
                    error: function() {
                        $('#status-text').text('Error checking progress');
                    }
                });
            }

            function updateProgressBar(progress) {
                $('#progress-bar').css('width', progress + '%');
                $('#progress-text').text(progress + '% Complete');
            }
        });
    </script>
</body>
</html>
```

A abordagem Celery tem várias vantagens:
- Descarrega processamento pesado do seu servidor web
- Escalável para muitas tarefas concorrentes
- Tolerante a falhas - as tarefas podem ser tentadas novamente se falharem
- Pode ser distribuído por vários servidores de worker

## Melhorando a Experiência do Usuário

Além das barras de progresso, vamos ver algumas outras funcionalidades interativas que podem melhorar sua aplicação Flask:

### 1. Indicadores de Carregamento Animados

Para operações mais curtas onde uma barra de progresso completa não é necessária, considere usar indicadores de carregamento animados:

```html
<div id="loading-spinner" class="spinner-border text-primary" role="status" style="display: none;">
    <span class="visually-hidden">Loading...</span>
</div>
```

Alternar visibilidade com JavaScript:

```javascript
// Show spinner
$('#loading-spinner').show();

// Hide spinner when done
$('#loading-spinner').hide();
```

### 2. Notificações Toast

Forneça feedback sobre operações concluídas com notificações toast:

```html
<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
    <div id="notification-toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="me-auto" id="toast-title">Notification</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body" id="toast-message">
            Operation complete!
        </div>
    </div>
</div>
```

JavaScript para mostrar o toast:

```javascript
function showToast(title, message) {
    $('#toast-title').text(title);
    $('#toast-message').text(message);

    const toast = new bootstrap.Toast(document.getElementById('notification-toast'));
    toast.show();
}
```

### 3. Barras de Progresso de Upload

Para uploads de arquivos, você pode rastrear o progresso usando o objeto `XMLHttpRequest`:

```javascript
$('#upload-form').submit(function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            updateProgressBar(percentComplete);
        }
    });

    xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
            $('#status-text').text('Upload complete!');
        } else {
            $('#status-text').text('Error: ' + xhr.statusText);
        }
    });

    xhr.open('POST', '/upload', true);
    xhr.send(formData);
});
```

### 4. Progresso com Múltiplos Passos

Para processos com múltiplos passos, considere usar um indicador de passo:

```html
<div class="progress-tracker">
    <div class="progress">
        <div id="multi-step-progress" class="progress-bar" role="progressbar" style="width: 0%"></div>
    </div>
    <div class="steps mt-2">
        <div class="step active" id="step-1">Step 1: Upload</div>
        <div class="step" id="step-2">Step 2: Process</div>
        <div class="step" id="step-3">Step 3: Complete</div>
    </div>
</div>
```

Adicione um pouco de CSS para deixá-lo bonito:

```css
.steps {
    display: flex;
    justify-content: space-between;
}

.step {
    text-align: center;
    color: #6c757d;
}

.step.active {
    color: #0d6efd;
    font-weight: bold;
}

.step.completed {
    color: #198754;
}
```

JavaScript para atualizar os passos:

```javascript
function moveToStep(stepNumber) {
    // Clear all current states
    $('.step').removeClass('active completed');

    // Mark current step as active
    $('#step-' + stepNumber).addClass('active');

    // Mark previous steps as completed
    for (let i = 1; i < stepNumber; i++) {
        $('#step-' + i).addClass('completed');
    }

    // Update progress bar
    const progress = ((stepNumber - 1) / 2) * 100;
    $('#multi-step-progress').css('width', progress + '%');
}
```

## Melhores Práticas para Elementos Interativos do Flask

Ao implementar essas funcionalidades, tenha em mente estas melhores práticas:

1. **Forneça fallbacks** para navegadores com JavaScript desativado
2. **Evite bloquear o thread principal** - use threads em segundo plano ou Celery para operações longas
3. **Considere as expectativas de tempo do usuário** - para operações com menos de 1 segundo, um simples spinner pode ser suficiente
4. **Lide com erros graciosamente** - sempre forneça feedback quando algo der errado
5. **Otimize para celular** - garanta que seus indicadores de progresso estejam visíveis em telas menores
6. **Teste com conexões lentas** - use o throttling do navegador para simular redes lentas

<h2>Aprofundando: Extensões Flask</h2>

Várias extensões Flask podem ajudar a aprimorar a interatividade da sua aplicação:

- **Flask-WTF** para manipulação de formulários com proteção CSRF
- **Flask-Uploads** para uploads de arquivos
- **Flask-Caching** para melhorar o desempenho
- **Flask-RESTful** para construir APIs
- **Flask-Login** para autenticação de usuário

## Conclusão

Barras de progresso e elementos interativos melhoram significativamente a experiência do usuário em aplicações web. Com a flexibilidade do Flask, você tem múltiplas abordagens disponíveis - desde o simples polling AJAX até WebSockets e tarefas em segundo plano com Celery.

A melhor abordagem depende das suas necessidades específicas:

- Para aplicações simples com tarefas mais leves, o polling AJAX funciona bem
- Para atualizações em tempo real mais responsivas, o Flask-SocketIO é excelente
- Para processamento em segundo plano pesado, o Celery oferece a solução mais robusta

Ao implementar essas funcionalidades interativas, você pode criar aplicações Flask que não apenas funcionam bem, mas também proporcionam uma experiência de usuário satisfatória que mantém os usuários engajados e informados.

Leia também:

- [Módulos Python: Um Guia para Iniciantes para Organizar Seu Código]({{< relref "posts/python-modules-guide/" >}})
- [Usando a Camada Gratuita do Oracle Cloud]({{< relref "posts/oracle_cloud_vps/" >}})
- [Como Configurar e Usar GitHub Secrets com Contêineres e Aplicações Voltadas para a Internet]({{< relref "posts/how-to-setup-github-secrets/" >}})

---
Você pode entrar em contato comigo sobre este e outros tópicos no meu e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
