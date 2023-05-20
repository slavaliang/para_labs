// document - страница, на которой octotree clone будет производить изменения
// activateButton - кнопка-триггер 
let activateButton = document.createElement('button');
activateButton.id = 'activate-button';
activateButton.textContent = 'Clonocto';
document.body.appendChild(activateButton);
// panel - блок, в котором будет размещено дерево каталогов репозитория
const panel = document.createElement('div');
panel.id = 'panel';
// Получение URL страницы
const url = new URL(window.location.href);
// Получение имени владельца репозитория
let owner = url.pathname.split('/')[1];
// Получение имени репозитория
let repo = url.pathname.split('/')[2];
// SHA-хэш дерева из URL-адреса
let sha = url.pathname.split('/')[4];
console.log(url)
// API, откуда берем данные
let apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
console.log(apiUrl)
// Panel Content - вся инфа, расположенная на panel
const panelContent = document.createElement('div');
// repoInfo - инфа про репозиторий
const repoInfo = document.createElement('div');
repoInfo.textContent = repo + ' repository structure';
repoInfo.id = 'repo-info';
// pin - кнопка закрепа
const pin = document.createElement('button'); // Create new pin element
pin.id = 'pin-button';
pin.textContent = 'pin';
// добавление элементов на страницу
panelContent.appendChild(repoInfo)
panel.appendChild(pin);
panel.appendChild(panelContent);
document.body.appendChild(panel);
//-----------------------------------------------------------------------------------------------------
// выдвижение панельки, если мышка навелась на триггерную кнопку
let panelTimeout; // Добавьте переменную для хранения ID таймера
let showingPanel = function () {
    clearTimeout(panelTimeout); // Очистить предыдущее запланированное скрытие панели
    panel.classList.add('show');
    activateButton.classList.remove('show');
};
let hidingPanel = function () {
    panelTimeout = setTimeout(() => { // Сохранить ID таймера в переменной
        panel.classList.remove('show');
    }, 1000);
    activateButton.classList.add('show');
};
activateButton.addEventListener('mouseenter', showingPanel, false);
activateButton.addEventListener('mouseleave', hidingPanel, false);
panel.addEventListener('mouseenter', () => clearTimeout(panelTimeout), false); // Добавьте обработчик для очистки таймера при наведении на панель
panel.addEventListener('mouseleave', hidingPanel, false);
//-----------------------------------------------------------------------------------------------------
const docheader = document.getElementById('js-repo-pjax-container');
let isPinned = localStorage.getItem('isPinned') === 'true';
function handlePinClick() {
    if (isPinned) {
        if (panel) {
            panel.removeEventListener('mouseleave', hidingPanel, false);
        }
        isPinned = false;
        docheader.style.marginLeft = "0px";
    } else {
        if (panel) {
            panel.removeEventListener('mouseleave', hidingPanel, false);
        }
        isPinned = true;
        docheader.style.marginLeft = "250px";
    }
}
if (pin) {
    pin.addEventListener('click', handlePinClick);
}
// ---------------------------------------------------------------------------------------------------------
//получение имени ветки через URL-адрес
const branchName = window.location.pathname.split('/')[4];
console.log(branchName);
// Извлечение древовидных данных из GitHub API
function fetchTreeData(owner, repo, sha) {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const files = data.tree.filter(obj => obj.type === 'blob');
            const folders = data.tree.filter(obj => obj.type === 'tree');
            return { files, folders };
        });
}
// Создание элемента дерева
function createTreeItem(item) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.id = 'link'
    link.textContent = item.path;
    console.log(item.path)
    if (item.type === 'tree') {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const childList = listItem.querySelector('ul');
            if (childList) {
                childList.remove();
            } else {
                fetchTreeData(owner, repo, item.sha)
                    .then(({ files, folders }) => {
                        const treeList = createTreeList(folders.concat(files));
                        treeList.style.marginLeft = '10px';
                        listItem.appendChild(treeList);
                    });
            }
        });
    } else {
        console.log(item.path)
        const changed_url = item.url
            .replace(`/api.`, '/')
            .replace(`/repos/`, '/')
            .replace(`/git/`, '/')
            .replace(`/blobs`, '/blob')
            .replace(`/${item.sha}`, '/');
        //Добавление ссылки на файл к соотвествующему тегу
        link.href = changed_url + `${branchName}/` + item.path;
    }
    listItem.appendChild(link);
    return listItem;
}
// Создание списка дерева
function createTreeList(items) {
    const treeList = document.createElement('ul');
    items.forEach(item => {
        const path = item.path.split('/')
        const treeItem = createTreeItem(item);
        if (path.length < 2) {
            treeList.appendChild(treeItem);
        }
    });
    return treeList;
}
// Размещение полученного списка файлов и папок на панели
function renderTree(owner, repo, sha) {
    fetchTreeData(owner, repo, sha)
        .then(({ files, folders }) => {
            const treeList = createTreeList(folders.concat(files));
            panelContent.appendChild(treeList);
        });
}
// if (sha=''){

// }
renderTree(owner, repo, sha);
// путем извлечения из строки URL имя ветки получать не вариант, ввиду того, что у некоторых пользователей есть классная привычка называть ветку строкой со слэшами(/), ввиду чего имя ветки считывается не полностью
// например:
// репозиторий:https://github.com/iluwatar/java-design-patterns
// имя ветки:dependabot/maven/org.apache.maven.plugins-maven-checkstyle-plugin-3.2.2
// результат считывания:dependabot
// !!! при переходе на другой файл, кнопка пин перестает работать (скорее всего дело в том, что объект, с которым производится изменение, то есть страница, остался старым, следовательно новая страница никаким образом не изменитс после нажатия пин кнопки)