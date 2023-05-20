// Получение ссылки на элементы на странице
const addButton = document.getElementById('add-button');
const commentInput = document.getElementById('comment-input');

// Добавление обработчика события выделения текста
document.addEventListener('mouseup', (event) => {
  const selectedText = window.getSelection().toString();

  // Проверка, что выделенный текст не пустой
  if (selectedText) {
    addButton.style.display = 'block';
    addButton.style.top = `${event.pageY}px`;
    addButton.style.left = `${event.pageX}px`;
    addButton.dataset.text = selectedText;
  } else {
    addButton.style.display = 'none';
  }Ка
});

// Добавление обработчика нажатия на кнопку "Добавить"
addButton.addEventListener('click', () => {
  const selectedText = addButton.dataset.text;
  const comment = commentInput.value;

  if (selectedText && comment) {
    createNoteBlock(selectedText, comment);
    // Очистка полей ввода после добавления блока
    addButton.style.display = 'none';
    commentInput.value = '';
  }
});

// Создание блока с выделенным текстом и комментарием
function createNoteBlock(text, comment) {
  const noteBlock = document.createElement('div');
  noteBlock.classList.add('note-block');

  const noteText = document.createElement('p');
  noteText.textContent = text;

  const noteComment = document.createElement('p');
  noteComment.textContent = comment;

  noteBlock.appendChild(noteText);
  noteBlock.appendChild(noteComment);

  // Добавление блока на popup-окно расширения
  const notesContainer = document.getElementById('notes-container');
  notesContainer.appendChild(noteBlock);
}



// const highlighted = document.getElementById('highlighted');
// const comment = document.getElementById('comment');
// const addBtn = document.getElementById('add');
// const blocks = document.getElementById('blocks');

// let selection = '';

// // Обработчик выделения текста
// document.addEventListener('selectionchange', () => {
//     const selectedText = window.getSelection().toString();
//     if (selectedText && selectedText !== selection) {
//         selection = selectedText;
//         highlighted.textContent = selectedText;
//     }
// });

// // Обработчик добавления блока
// addBtn.addEventListener('click', () => {
//     if (selection) {
//         const block = document.createElement('div');
//         const text = document.createElement('p');
//         const commentText = document.createElement('p');
//         text.textContent = selection;
//         commentText.textContent = comment.value;
//         block.appendChild(text);
//         block.appendChild(commentText);
//         blocks.appendChild(block);
//         selection = '';
//         highlighted.textContent = '';
//         comment.value = '';
//     }
// });


// // Содержимое файла popup.js в вашем расширении

// // Получение ссылки на элементы на странице
// const selectedTextElement = document.getElementById('selected-text');
// const commentInput = document.getElementById('comment-input');
// const addButton = document.getElementById('add-button');

// // Обработчик нажатия кнопки "Добавить"
// addButton.addEventListener('click', () => {
//   const selectedText = selectedTextElement.value;
//   const comment = commentInput.value;

//   if (selectedText && comment) {
//     createNoteBlock(selectedText, comment);
//     // Очистка полей ввода после добавления блока
//     selectedTextElement.value = '';
//     commentInput.value = '';
//   }
// });

// // Создание блока с выделенным текстом и комментарием
// function createNoteBlock(text, comment) {
//   const noteBlock = document.createElement('div');
//   noteBlock.classList.add('note-block');

//   const noteText = document.createElement('p');
//   noteText.textContent = text;

//   const noteComment = document.createElement('p');
//   noteComment.textContent = comment;

//   noteBlock.appendChild(noteText);
//   noteBlock.appendChild(noteComment);

//   // Добавление блока на popup-окно расширения
//   const notesContainer = document.getElementById('notes-container');
//   notesContainer.appendChild(noteBlock);
// }



