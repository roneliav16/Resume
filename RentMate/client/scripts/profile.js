document.addEventListener('DOMContentLoaded', async () => {
    async function load(){
    const r = await fetch('/api/account/profile',{credentials:'include'});
    const j = await r.json();
    document.getElementById('fullName').value = j.fullName || '';
    document.getElementById('mode').value = j.mode || 'light';
    }

    document.getElementById('save').onclick = async ()=>{
    const body = {
        fullName: document.getElementById('fullName').value,
        mode: document.getElementById('mode').value
    };

    const r = await fetch('/api/account/profile',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    document.getElementById('out').textContent = r.ok === true ? "Changes Accepted!" : "Changes Rejected !";
    };

    document.getElementById('changePwd').onclick = async ()=>{
    const body = { oldPassword: oldPassword.value, newPassword: newPassword.value };
    const r = await fetch('/api/account/change-password',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    document.getElementById('out').textContent = r.ok === true ? "Changes Accepted!" : "Changes Rejected !";
    };

    load();
});