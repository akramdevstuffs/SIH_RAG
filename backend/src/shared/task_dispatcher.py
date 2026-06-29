from shared.celery_client import celery
from shared.tasks_name import TaskName

def enqueue_process_file(metadata: dict):
    """
    Enqueue a task to process a file.

    Args:
        file_path (str): The path to the file to be processed.
        metadata (dict): Additional metadata related to the file.
    """
    celery.send_task(TaskName.PROCESS_FILE, args=[metadata])