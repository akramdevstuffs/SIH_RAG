const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function search(query) {
    const response = await fetch(`${API_URL}/search/${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    let res = await response.json();
    console.log("Search response:", res);
    return res;
}

export async function downloadFile(fileId) {
    const response = await fetch(`${API_URL}/upload/download/${fileId}`);
    if (!response.ok) {
        throw new Error(await response.text() || `HTTP error! status: ${response.status}`);
    }
    return await response.blob();
}

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await response.text() || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

export async function getFileStatus(fileId) {
    const response = await fetch(`${API_URL}/upload/status/${fileId}`);
    if (!response.ok) {
        throw new Error(await response.text() || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
}