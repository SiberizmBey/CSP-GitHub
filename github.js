async function getRealLastRepo() {
    const username = document.querySelector('.continue-card')?.dataset.githubUser || 'SiberizmBey';
    const avatarImg = document.getElementById('github-avatar');
    const repoTitle = document.getElementById('repo-name');
    const statusText = document.getElementById('repo-status');

    try {
        // Profil resmini çek
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        const user = await userRes.json();
        avatarImg.src = user.avatar_url;

        // Tüm repoları çek ve manuel sırala
        const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        const repos = await repoRes.json();

        // En son "push" yapılanı (pushed_at) bul
        const lastPushedRepo = repos.sort((a, b) => 
            new Date(b.pushed_at) - new Date(a.pushed_at)
        )[0];

        if (lastPushedRepo) {
            repoTitle.innerText = lastPushedRepo.name;
            statusText.innerText = "SON ÇALIŞMA";
            
            document.querySelector('.continue-card').onclick = () => 
                window.open(lastPushedRepo.html_url, '_blank');
        }
    } catch (err) {
        repoTitle.innerText = "Hata oluştu!";
    }
}

getRealLastRepo();