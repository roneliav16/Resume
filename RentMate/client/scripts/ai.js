document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('aiForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
        title: fd.get('title'),
        description: fd.get('description') || '',
        basePrice: Number(fd.get('basePrice')),
        rentalDays: Number(fd.get('rentalDays')),
    };
    const res = await fetch('/api/ai/price-suggest', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });
        
    const data = await res.json();
    document.getElementById('aiResult').innerHTML = `
    <p><strong>Suggested price:</strong> ${data.suggestedPrice}</p>
    <p><strong>Confidence:</strong> ${data.confidence}%</p>
    <p>${data.explanation}</p>
    `;

    document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
    });
});