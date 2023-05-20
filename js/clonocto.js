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
let sha; // Глобальная переменная для имени ветки
function getCurrentBranch(owner, repo) {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            sha = data.default_branch; // Сохраняем имя ветки в глобальную переменную
        });
}
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

const focusedElement = document.querySelector(':focus');
if (focusedElement) {
    focusedElement.blur(); // Снимаем фокус с текущего элемента
}

// Обновление кнопки пин
function updatePinButton() {
    if (isPinned) {
        docheader.style.marginLeft = "250px";
        pin.style.backgroundColor = ""; // Убираем цвет фона кнопки
    } else {
        docheader.style.marginLeft = "0px";
        pin.style.backgroundColor = "red"; // Устанавливаем красный цвет фона кнопки
    }
}

// Обработчик события при нажатии на кнопку пин
function handlePinClick() {
    if (isPinned) {
        panel.removeEventListener('mouseleave', hidingPanel, false);
        isPinned = false;
        localStorage.setItem('isPinned', 'false'); // Сохранение состояния кнопки в localStorage
    } else {
        panel.removeEventListener('mouseleave', hidingPanel, false);
        isPinned = true;
        localStorage.setItem('isPinned', 'true'); // Сохранение состояния кнопки в localStorage
    }
    updatePinButton(); // Обновление внешнего вида кнопки пин
}

// Добавьте обработчик события 'click' для ссылок на странице
document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'A') {
        if (target.getAttribute('href').startsWith('#')) {
            // Если ссылка якорная, игнорируем ее
            return;
        }
        // Снимаем фокус с текущего элемента
        const focusedElement = document.querySelector(':focus');
        if (focusedElement) {
            focusedElement.blur();
        }
        // Восстанавливаем обработчик события 'mouseleave' для панели
        panel.addEventListener('mouseleave', hidingPanel, false);
        // Обновляем состояние кнопки пин
        updatePinButton();
    }
});

if (pin) {
    pin.addEventListener('click', handlePinClick);
    updatePinButton();

}
// --------------------------------------------------------------------------------------------------------
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
function createTreeItem(item, basePath = '') {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    const pathParts = item.path.split('/');
    link.id = 'link';
    link.textContent = pathParts[pathParts.length - 1];

    if (item.type === 'tree') {
        link.addEventListener('click', (event) => {
            // event.preventDefault();
            const childList = listItem.querySelector('ul');
            if (childList) {
                childList.remove();
            } else {
                isPinned = false;
                pin.addEventListener('click', handlePinClick);
                setTimeout(() => {
                    fetchTreeData(owner, repo, item.sha)
                        .then(({ files, folders }) => {
                            const treeList = createTreeList(folders.concat(files), basePath + '/' + item.path);
                            treeList.style.marginLeft = '10px';
                            listItem.appendChild(treeList);
                        })
                        .catch(error => {
                            console.error('Ошибка при получении данных:', error);
                        });
                }, 0);
            }
        });
    } else {
        const changed_url = item.url
            .replace(`/api.`, '/')
            .replace(`/repos/`, '/')
            .replace(`/git/`, '/')
            .replace(`/blobs`, '/blob')
            .replace(`/${item.sha}`, '/');
        const filePath = basePath ? `${basePath}/${item.path}` : item.path;
        link.href = changed_url + `${sha}/` + encodeURIComponent(filePath);
    }
    listItem.appendChild(link);
    return listItem;
}
// Создание списка дерева
function createTreeList(items, basePath = '') {
    const treeList = document.createElement('ul');
    items.forEach(item => {
        const treeItem = createTreeItem(item, basePath);
        const pathArray = item.path.split('/')
        if (pathArray.length < 2) {
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

getCurrentBranch(owner, repo)
    .then(() => {
        renderTree(owner, repo, sha);
        repoInfo.textContent += ', ' + sha + ' branch';
    })
    .catch(error => {
        console.error('Ошибка получения имени ветки:', error);
    });

// Проверка состояния закрепления кнопки "pin" при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    isPinned = localStorage.getItem('isPinned') === 'true';
    if (isPinned) {
        handlePinClick();
    }
});
// путем извлечения из строки URL имя ветки получать не вариант, ввиду того, что у некоторых пользователей есть классная привычка называть ветку строкой со слэшами(/), ввиду чего имя ветки считывается не полностью
// например:
// репозиторий:https://github.com/iluwatar/java-design-patterns
// имя ветки:dependabot/maven/org.apache.maven.plugins-maven-checkstyle-plugin-3.2.2
// результат считывания:dependabot
// !!! при переходе на другой файл, кнопка пин перестает работать (скорее всего дело в том, что объект, с которым производится изменение, то есть страница, остался старым, следовательно новая страница никаким образом не изменитс после нажатия пин кнопки)