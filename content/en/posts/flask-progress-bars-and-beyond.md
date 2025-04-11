---
date: 2025-04-11T11:33:12-03:00
draft: true
title: "Building Interactive Flask Web Apps: Progress Bars and Beyond"
description: "A practical guide to implementing progress bars, real-time updates, and other interactive features in your Flask web applications."
url: ""
featured_image: "https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-flask-progress-bars.png"
categories:
  - tutorial
tags:
  - python
  - flask
  - web development
  - javascript
  - ajax
  - socketio
---

Flask is a lightweight and flexible Python web framework that's perfect for everything from simple APIs to complex web applications. While it's minimal by design, Flask can be extended to create highly interactive, modern web experiences. One of the most requested features in web applications is the ability to show progress for long-running tasks - whether it's file uploads, data processing, or complex computations.

In this article, I'll walk through several approaches to implementing progress bars and other interactive features in Flask, from simple solutions to more advanced real-time implementations.

## The Progress Bar Challenge

When a user initiates a time-consuming operation in your web app, providing visual feedback is crucial for a good user experience. Without it, users might think the application has frozen, leading to frustration and potential abandonment.

Here's what we'll cover:

1. Simple progress indicators with AJAX polling
2. Real-time progress bars with Flask-SocketIO
3. Task queues with Celery for background processing
4. Enhancing UX with additional interactive elements

Let's get started with a basic Flask setup and then progressively enhance it.

## Basic Setup: A Flask Application

First, let's create a simple Flask application structure:

```bash
mkdir flask-progress-app
cd flask-progress-app
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask
```

Now, let's create a minimal Flask app:

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

Create a basic HTML template:

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

## Approach 1: AJAX Polling for Progress Updates

This is the simplest approach and works well for most use cases. Let's add functionality to start a long-running task and poll for progress updates.

First, add these routes to `app.py`:

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

Now, let's add the JavaScript to poll for updates:

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

This implementation works by:
1. Starting a task in a background thread when requested
2. Periodically checking the progress via AJAX requests
3. Updating the progress bar based on the response

While simple, this approach has limitations - it increases server load with frequent polling and doesn't provide true real-time updates.

## Approach 2: Real-Time Progress with Flask-SocketIO

For a more responsive experience, we can use WebSockets to push updates to the client in real-time. Let's implement this using Flask-SocketIO:

```bash
pip install flask-socketio eventlet
```

Update `app.py`:

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

Create a new template for the SocketIO version:

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

With WebSockets, we get:
- True real-time updates without polling
- Reduced server load compared to constant AJAX requests
- A more responsive user experience

## Approach 3: Background Tasks with Celery and Progress Tracking

For production applications with long-running tasks, Celery is a better option. It provides a robust task queue that can handle distributed workloads. Let's set it up with Redis as the message broker:

```bash
pip install flask celery redis
```

Here's how to implement progress bars with Celery:

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

And the HTML template:

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

The Celery approach has several advantages:
- Offloads heavy processing from your web server
- Scalable to many concurrent tasks
- Fault-tolerant - tasks can be retried if they fail
- Can be distributed across multiple worker servers

## Enhancing the User Experience

Beyond just progress bars, let's look at some other interactive features that can improve your Flask application:

### 1. Animated Loading Indicators

For shorter operations where a full progress bar isn't needed, consider using animated loading indicators:

```html
<div id="loading-spinner" class="spinner-border text-primary" role="status" style="display: none;">
    <span class="visually-hidden">Loading...</span>
</div>
```

Toggle visibility with JavaScript:

```javascript
// Show spinner
$('#loading-spinner').show();

// Hide spinner when done
$('#loading-spinner').hide();
```

### 2. Toast Notifications

Provide feedback on completed operations with toast notifications:

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

JavaScript to show the toast:

```javascript
function showToast(title, message) {
    $('#toast-title').text(title);
    $('#toast-message').text(message);

    const toast = new bootstrap.Toast(document.getElementById('notification-toast'));
    toast.show();
}
```

### 3. Upload Progress Bars

For file uploads, you can track progress using the `XMLHttpRequest` object:

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

### 4. Progress with Multiple Steps

For multi-step processes, consider using a step indicator:

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

Add some CSS to make it look nice:

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

JavaScript to update the steps:

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

## Best Practices for Flask Interactive Elements

When implementing these features, keep these best practices in mind:

1. **Provide fallbacks** for browsers with JavaScript disabled
2. **Avoid blocking the main thread** - use background threads or Celery for long operations
3. **Consider user timing expectations** - for operations under 1 second, a simple spinner may be sufficient
4. **Handle errors gracefully** - always provide feedback when something goes wrong
5. **Optimize for mobile** - ensure your progress indicators are visible on smaller screens
6. **Test with slow connections** - use browser throttling to simulate slow networks

## Taking It Further: Flask Extensions

Several Flask extensions can help enhance your application's interactivity:

- **Flask-WTF** for form handling with CSRF protection
- **Flask-Uploads** for file uploads
- **Flask-Caching** to improve performance
- **Flask-RESTful** for building APIs
- **Flask-Login** for user authentication

## Conclusion

Progress bars and interactive elements significantly improve user experience in web applications. With Flask's flexibility, you have multiple approaches available - from simple AJAX polling to WebSockets and Celery background tasks.

The best approach depends on your specific needs:

- For simple applications with lighter tasks, AJAX polling works well
- For more responsive real-time updates, Flask-SocketIO is excellent
- For heavy-duty background processing, Celery provides the most robust solution

By implementing these interactive features, you can create Flask applications that not only function well but also provide a satisfying user experience that keeps users engaged and informed.

---
You can reach out to contact me about this and other topics at my email **<lucas.fernandes.df@gmail.com>** or by filling the form below.
