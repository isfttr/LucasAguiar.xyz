---
date: 2025-04-11T14:33:12.000Z
draft: true
title: 'Desenvolvendo Aplicações Web Flask Interativas: Barras de Progresso e Além'
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
translation_source_hash: fc76b3d93a52f8bc30b3e3ed66ff7f43756f9ece420b0e0ccdd8f2ea2dec8b08
---
Flask é um framework web Python leve e flexível, perfeito para tudo, desde APIs simples a aplicações web complexas. Embora seja minimalista por design, o Flask pode ser estendido para criar experiências web modernas e altamente interativas. Uma das funcionalidades mais solicitadas em aplicações web é a capacidade de mostrar o progresso de tarefas de longa duração - sejam elas uploads de arquivos, processamento de dados ou cálculos complexos.

Neste artigo, abordarei várias abordagens para implementar barras de progresso e outras funcionalidades interativas no Flask, desde soluções simples até implementações em tempo real mais avançadas.

## O Desafio da Barra de Progresso

Quando um utilizador inicia uma operação demorada na sua aplicação web, fornecer feedback visual é crucial para uma boa experiência do utilizador. Sem ele, os utilizadores podem pensar que a aplicação congelou, levando à frustração e a um potencial abandono.

Aqui está o que abordaremos:

1. Indicadores de progresso simples com polling AJAX
2. Barras de progresso em tempo real com Flask-SocketIO
3. Filas de tarefas com Celery para processamento em segundo plano
4. Melhorar a UX com elementos interativos adicionais

Vamos começar com uma configuração básica do Flask e depois aprimorá-la progressivamente.

## Configuração Básica: Uma Aplicação Flask

Primeiro, vamos criar uma estrutura de aplicação Flask simples:

```bash
mkdir flask-progress-app
cd flask-progress-app
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask
```

Agora, vamos criar uma aplicação Flask mínima:

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

Esta é a abordagem mais simples e funciona bem para a maioria dos casos de uso. Vamos adicionar funcionalidades para iniciar uma tarefa de longa duração e fazer polling para atualizações de progresso.

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

Agora, vamos adicionar o JavaScript para fazer polling de atualizações:

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
1. Inicia uma tarefa num thread em segundo plano quando solicitado
2. Verifica periodicamente o progresso através de requisições AJAX
3. Atualiza a barra de progresso com base na resposta

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
- Carga reduzida no servidor em comparação com requisições AJAX constantes
- Uma experiência de utilizador mais responsiva

## Abordagem 3: Tarefas em Segundo Plano com Celery e Rastreamento de Progresso

Para aplicações de produção com tarefas de longa duração, Celery é uma opção melhor. Ele fornece uma fila de tarefas robusta que pode lidar com cargas de trabalho distribuídas. Vamos configurá-lo com Redis como o message broker:

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
- Descarrega o processamento pesado do seu servidor web
- Escalável para muitas tarefas concorrentes
- Tolerante a falhas - as tarefas podem ser tentadas novamente se falharem
- Pode ser distribuído por vários servidores worker

## Melhorando a Experiência do Utilizador

Além das barras de progresso, vamos ver algumas outras funcionalidades interativas que podem melhorar a sua aplicação Flask:

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

Para uploads de arquivos, pode rastrear o progresso usando o objeto `XMLHttpRequest`:

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

Para processos de várias etapas, considere usar um indicador de etapa:

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

Adicione algum CSS para deixá-lo bonito:

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

JavaScript para atualizar as etapas:

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

## Melhores Práticas para Elementos Interativos Flask

Ao implementar essas funcionalidades, tenha em mente estas melhores práticas:

1. **Forneça alternativas** para navegadores com JavaScript desativado
2. **Evite bloquear o thread principal** - use threads em segundo plano ou Celery para operações longas
3. **Considere as expectativas de tempo do utilizador** - para operações com menos de 1 segundo, um simples spinner pode ser suficiente
4. **Lide com erros de forma elegante** - sempre forneça feedback quando algo corre mal
5. **Otimize para dispositivos móveis** - garanta que os seus indicadores de progresso sejam visíveis em ecrãs menores
6. **Teste com conexões lentas** - use a limitação do navegador para simular redes lentas

## Indo Mais Longe: Extensões Flask

Várias extensões Flask podem ajudar a melhorar a interatividade da sua aplicação:

- **Flask-WTF** para manipulação de formulários com proteção CSRF
- **Flask-Uploads** para uploads de arquivos
- **Flask-Caching** para melhorar o desempenho
- **Flask-RESTful** para construir APIs
- **Flask-Login** para autenticação de utilizadores

## Conclusão

Barras de progresso e elementos interativos melhoram significativamente a experiência do utilizador em aplicações web. Com a flexibilidade do Flask, tem várias abordagens disponíveis - desde o polling AJAX simples até WebSockets e tarefas em segundo plano com Celery.

A melhor abordagem depende das suas necessidades específicas:

- Para aplicações simples com tarefas mais leves, o polling AJAX funciona bem
- Para atualizações em tempo real mais responsivas, o Flask-SocketIO é excelente
- Para processamento em segundo plano de alta demanda, o Celery oferece a solução mais robusta

Ao implementar essas funcionalidades interativas, pode criar aplicações Flask que não apenas funcionam bem, mas também proporcionam uma experiência de utilizador satisfatória que mantém os utilizadores envolvidos e informados.

---
Pode contactar-me sobre este e outros tópicos através do meu e-mail **<contact@lucasaguiar.xyz>** ou preenchendo o formulário abaixo.
