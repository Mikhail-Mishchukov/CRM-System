let activeData; // для того что бы после поиска, отсортировывать только найденных в поиске клиентов 
let timeoutPreload; // переменная для отслеживания времени для закрытия прелоудера
let timerAnimationPreload;

// Функция для запроса всех клиентов с сервера
async function loadClientsInformation() {
    const response = await fetch('http://localhost:3000/api/clients');
    const data = await response.json();
    // Обновляем activedata, все действия с сортировкой необходимо делать с ней
    activeData = data;
    return data;
}
// Функция для создания отображения контактов в таблице
function createListOfContact(data) {
    const td = createDOMElement('td');
    const list = createDOMElement('ul', 'body-line__contact-list');

    for (let i = 0; i < data.length; i++) {
        const item = createDOMElement('li', 'body-line__contact-item');

        const marker = createDOMElement('button', 'marker');

        if ((data[i].type === 'tel')) {
            marker.classList.add('phone');
            tippy(marker, {
                content: `Телефон: ${data[i].value}`,
            });

        }
        if ((data[i].type === 'Vk')) {
            marker.classList.add('vk');
            tippy(marker, {
                content: `ВКонтакте: ${data[i].value}`,
            });
        }
        if ((data[i].type === 'email')) {
            marker.classList.add('mail');
            tippy(marker, {
                content: `Email: ${data[i].value}`,
            });
        }
        if ((data[i].type === 'Facebook')) {
            marker.classList.add('fb');
            tippy(marker, {
                content: `Facebook: ${data[i].value}`,
            });
        }
        if ((data[i].type === 'other')) {
            marker.classList.add('other');
            tippy(marker, {
                content: `Другое: ${data[i].value}`,
            });
        }
        if (((data.length > 5) && (i === 4)) || (i > 4)) {
            item.classList.add('hide-contact')
        }
        item.append(marker);
        list.append(item);

    }
    if (data.length > 5) {
        const item = createDOMElement('li');
        const btnMore = createDOMElement('button', 'btn-more');
        btnMore.textContent = `+${data.length-4}`;
        btnMore.addEventListener('click', function() {
            const hideEl = list.querySelectorAll('.hide-contact');
            for (let i = 0; i < hideEl.length; i++) {
                hideEl[i].classList.remove('hide-contact');
            }
            btnMore.classList.add('hide-contact');
            list.closest('td').classList.add('td-contacts-more');
        })
        item.append(btnMore);
        list.append(item);
    }
    td.append(list);
    return (td);
}
// Функция для создания и открытия модального окна для удаления клиента
function deletePerson(id) {
    createModalWindow('Delete', id);
    setTimeout(openModalWindow, 200);
}
// Функция для создания и открытия модального окная для изменения клиента
function changePerson(id) {
    createModalWindow('Change', id);
    setTimeout(openModalWindow, 1000);
}
// Функция для копирование в буфер обмена
function copyToClipboard(id) {
    const copytext = document.createElement('input');
    const url = window.location.href;

    copytext.value = url + `person.html?id${id}`
    document.body.appendChild(copytext)
    copytext.select()
    document.execCommand('copy')
    document.body.removeChild(copytext)
}
// Функция для отрисовки таблицы для одного клиента
function createClientTable(data) {
    const tableBody = document.querySelector('.table__body');
    const line = createDOMElement('tr', 'table__body-line');
    const personID = createDOMElement('td', 'body-line__ID');

    personID.textContent = data.id;
    line.append(personID);

    const personFIO = createDOMElement('td', 'body-line__FIO');
    const link = createDOMElement('a', 'link-person');
    link.textContent = data.surname + ' ' + data.name + (data.lastName === undefined ? '' : (' ' + data.lastName));
    link.setAttribute('href', `person.html?id${data.id}`);
    personFIO.append(link);
    line.append(personFIO);

    const personDataCreate = createDOMElement('td', 'body-line__time');

    const dataCreateContainer = createDOMElement('span', 'time-date');

    const dataCreate = new Date(Date.parse(data.createdAt));
    dataCreateContainer.textContent = dataCreate.getDate() + '.' + (dataCreate.getMonth() < 10 ? ('0' + (dataCreate.getMonth() + 1)) : (dataCreate.getMonth() + 1)) + '.' + dataCreate.getFullYear();

    const timeCreateContainer = createDOMElement('span', 'time-time');

    timeCreateContainer.textContent = (dataCreate.getHours() < 10 ? ('0' + dataCreate.getHours()) : dataCreate.getHours()) + ':' + dataCreate.getMinutes();
    personDataCreate.append(dataCreateContainer);
    personDataCreate.append(timeCreateContainer);
    line.append(personDataCreate);

    const personDataChange = createDOMElement('td', 'body-line__time');

    const dataChangeContainer = createDOMElement('span', 'time-date');

    const dataChange = new Date(Date.parse(data.updatedAt));
    dataChangeContainer.textContent = dataChange.getDate() + '.' + (dataChange.getMonth() < 10 ? ('0' + (dataChange.getMonth() + 1)) : (dataChange.getMonth() + 1)) + '.' + dataChange.getFullYear();
    const timeChangeContainer = createDOMElement('span', 'time-time');

    timeChangeContainer.textContent = (dataChange.getHours() < 10 ? ('0' + dataChange.getHours()) : dataChange.getHours()) + ':' + dataChange.getMinutes();

    personDataChange.append(dataChangeContainer);
    personDataChange.append(timeChangeContainer);
    line.append(personDataChange);

    let contactsList = createListOfContact(data.contacts);
    line.append(contactsList);

    const containerChangeDelete = createDOMElement('td');

    const btnChange = createDOMElement('button', 'body-line__btn');
    btnChange.classList.add('change');
    btnChange.textContent = 'Изменить';
    btnChange.addEventListener('click', function() {
        btnChange.classList.remove('change');

        const changeLoaderContainer = createDOMElement('div', 'change-preloader');

        const changeLoader = createDOMElement('div', 'change-loader');

        setTimeout(function() {
            changeLoaderContainer.classList.add('change-done-load');
        }, 1000);
        setTimeout(function() {
            btnChange.classList.add('change');
            changeLoaderContainer.remove();
        }, 1500)

        changeLoaderContainer.append(changeLoader);
        btnChange.append(changeLoaderContainer);

        changePerson(data.id);
    });
    containerChangeDelete.append(btnChange);


    const btnDelete = createDOMElement('button', 'body-line__btn');
    btnDelete.classList.add('delete');
    btnDelete.textContent = 'Удалить';
    btnDelete.addEventListener('click', function() {
        btnDelete.classList.remove('delete');

        const deleteLoaderContainer = createDOMElement('div', 'delete-preloader');

        const deleteLoader = createDOMElement('div', 'delete-loader');

        deleteLoaderContainer.append(deleteLoader);
        btnDelete.append(deleteLoaderContainer);
        setTimeout(function() {
            deleteLoaderContainer.classList.add('delete-done-load');
        }, 500);
        setTimeout(function() {
            btnDelete.classList.add('delete');
            deleteLoaderContainer.remove();
        }, 1000)

        deletePerson(data.id);
    });
    containerChangeDelete.append(btnDelete);

    const btnCopy = createDOMElement('button', 'body-line__btn');
    btnCopy.classList.add('copy');
    btnCopy.textContent = 'Копировать';
    btnCopy.addEventListener('click', function() {
        btnCopy.classList.remove('copy');
        const copyLoaderContainer = createDOMElement('div', 'copy-preloader');
        const copyLoader = createDOMElement('div', 'copy-loader');
        setTimeout(function() {
            copyLoaderContainer.classList.add('copy-done-load');
        }, 250);
        setTimeout(function() {
            btnCopy.classList.add('copy');
            copyLoaderContainer.remove();
        }, 750)

        copyLoaderContainer.append(copyLoader);
        btnCopy.append(copyLoaderContainer);

        copyToClipboard(data.id);
    });
    containerChangeDelete.append(btnCopy);

    line.append(containerChangeDelete);


    tableBody.append(line);

}
// Функция для сравнения дат
function compareDate(a, b) {
    return (a - b);
}
// Функция для сортировки по свойству объекта
function sortByProp(obj, prop) {
    obj.sort((a, b) => a[prop] > b[prop] ? 1 : -1);
    return obj;
}
// Функция для сортировки по ID
function sortByID(btnSortID) {
    // Класс sort-active подсвечивает действующую сортировку
    // Класс sort-id/FIO/create/change добавляет стрелочку вверх
    // Класс sort-increase показывает, что уже один раз нажали на данную сортировку и при проверке если этот класс есть, значит нам нужна обратная сортировка
    // Класс sort-id/fio/create/change-decrease добавляет стрелочку вниз
    addPreloader();
    let activeSort = document.querySelector('.sort-active');
    if (activeSort) {
        activeSort.classList.remove('sort-active');
    }
    btnSortID.classList.add('sort-id');
    btnSortID.classList.add('sort-active');
    let dataForSort = [...activeData];
    let sortedData = sortByProp(dataForSort, 'id');

    if ((btnSortID.classList.contains('sort-active')) && (!btnSortID.classList.contains('sort-increase'))) {

        let increaseSort = document.querySelector('.sort-increase');
        if (increaseSort) {
            increaseSort.classList.remove('sort-increase');
        }
        btnSortID.classList.add('sort-increase');
        btnSortID.classList.remove('sort-id-decrease');

    } else {
        sortedData.reverse();
        btnSortID.classList.remove('sort-increase');
        btnSortID.classList.add('sort-id-decrease');
        btnSortID.classList.add('sort-active');
    }
    let tableNow = document.querySelectorAll('.table__body-line');
    if (tableNow.length != 0) {
        tableNow.forEach(item => {
            item.remove();
        })
    }
    for (let i = 0; i < sortedData.length; i++) {
        createClientTable(sortedData[i]);
    }
    removePreloader();
}
// Функция для сортировки по фио
function sortByFIO(data) {
    let dataForSort = [...activeData];
    let arrayOfValue = [];
    let sortedData = [];
    let count = 0;
    for (let i = 0; i < dataForSort.length; i++) {
        let strFIO = dataForSort[i].surname + dataForSort[i].name + dataForSort[i].lastName;
        arrayOfValue[i] = strFIO;
    }
    arrayOfValue.sort();

    for (let i = 0; i < arrayOfValue.length; i++) {
        for (let j = 0; j < dataForSort.length; j++) {
            let strFIO = dataForSort[j].surname + dataForSort[j].name + dataForSort[j].lastName;
            if (strFIO === arrayOfValue[i]) {
                sortedData[count] = dataForSort[j];
                count++;
                dataForSort.splice(j, 1);
            }
        }

    }
    document.querySelector('.sort-FIO').classList.add('sort-active');
    return (sortedData);

}
// Функция для сортировке по дате создания
function sortByCreateDate(data) {
    let dataForSort = [...data];
    let arrayOfValue = [];
    let sortedData = [];
    let count = 0;

    for (let i = 0; i < dataForSort.length; i++) {
        arrayOfValue[i] = new Date(dataForSort[i].createdAt);
    }
    arrayOfValue.sort(compareDate);

    for (let i = 0; i < arrayOfValue.length; i++) {
        for (let j = 0; j < dataForSort.length; j++) {

            if (new Date(dataForSort[j].createdAt).toString() === arrayOfValue[i].toString()) {
                sortedData[count] = dataForSort[j];
                count++;
                dataForSort.splice(j, 1);

            }
        }
    }
    document.querySelector('.sort-create').classList.add('sort-active');
    return (sortedData);

}
// Функция для сортировки по дате изменения
function sortByChangeDate(data) {

    let dataForSort = [...data];
    let arrayOfValue = [];
    let sortedData = [];
    let count = 0;

    for (let i = 0; i < dataForSort.length; i++) {
        arrayOfValue[i] = new Date(dataForSort[i].updatedAt);
    }
    arrayOfValue.sort(compareDate);

    for (let i = 0; i < arrayOfValue.length; i++) {
        for (let j = 0; j < dataForSort.length; j++) {

            if (new Date(dataForSort[j].updatedAt).toString() === arrayOfValue[i].toString()) {
                sortedData[count] = dataForSort[j];
                count++;
                dataForSort.splice(j, 1);

            }
        }
    }
    document.querySelector('.sort-change').classList.add('sort-active');
    return (sortedData);
}
//Функция отображение подсказок в поиске
async function autoHint(container, person) {
    const li = createDOMElement('li', 'auto-hints__item');
    const btn = createDOMElement('button', 'auto-hints__btn');
    btn.textContent = person.surname + ' ' + person.name;
    li.append(btn);
    container.append(li);
    btn.addEventListener('click', async(e) => {
        e.preventDefault();
        addPreloader();

        const input = document.querySelector('.header__input');
        const response = await fetch(`http://localhost:3000/api/clients?search=${input.value}`);
        const data = await response.json();
        input.value = btn.textContent;
        let tableNow = document.querySelectorAll('.table__body-line');
        if (tableNow.length != 0) {
            tableNow.forEach(item => {
                item.remove();
            })
        }

        if (data.length != 0) {
            activeData = data;
            for (let i = 0; i < data.length; i++) {
                createClientTable(data[i]);
            }
            tableNow = document.querySelectorAll('.table__body-line');
            tableNow.forEach(item => {
                item.classList.add('find-client');
            })

        } else {
            emptyOrNotFounded('Клиент не найден');
        }
        removePreloader();
    })

}
//Функция для запроса с сервера для поиска
async function getContent() {
    const containerAutoHints = document.querySelector('.container__auto-hints');
    const inputValue = document.querySelector('.header__input').value;
    const response = await fetch(`http://localhost:3000/api/clients?search=${inputValue}`);
    const data = await response.json();
    if (document.querySelector('.auto-hints__item')) {
        document.querySelectorAll('.auto-hints__item').forEach(item => {
            item.remove();
        })
    }
    if (inputValue !== '') {
        for (let i = 0; i < data.length; i++) {
            autoHint(containerAutoHints, data[i])
        }
    } else {
        addPreloader();
        const tableNow = document.querySelectorAll('.table__body-line');
        if (tableNow.length != 0) {
            tableNow.forEach(item => {
                item.remove();
            })
        }
        if (data.length != 0) {
            activeData = data;
            for (let i = 0; i < data.length; i++) {
                createClientTable(data[i]);
            }
        } else {
            emptyOrNotFounded('Клиент не найден');
        }
        removePreloader();
    }
}



// Стоп таймер для заставки
function stopTimerPreloader() {
    window.clearTimeout(timerAnimationPreload);
    window.clearTimeout(timeoutPreload);
}
// Функция для добавления заставки
function addPreloader() {
    if (document.querySelector('.done-load')) {
        document.querySelector('.preloader').remove();
    }
    if (!document.querySelector('.preloader')) {
        const preloader = createDOMElement('div', 'preloader');

        const loader = createDOMElement('div', 'loader');

        preloader.append(loader);
        document.querySelector('.table__body').append(preloader);
    }
    stopTimerPreloader();

}
// Функция для удаления заставки
function removePreloader() {
    timerAnimationPreload = setTimeout(function() {
        document.querySelector('.preloader').classList.add('done-load');
    }, 1000);

    timeoutPreload = setTimeout(function() {
        document.querySelector('.preloader').remove();
    }, 2000);

}

// Функция для создания пунктов в селекте

function createOption(value) {
    const option = createDOMElement('option');
    option.setAttribute('value', value);
    option.textContent = value;
    return (option);
}

// Функция для создания селекта 
function createSelect(selected = '') {
    //Создаем нативный селект 
    const select = createDOMElement('select', 'add-contacts-select');
    if (selected === '') { // если у нас форма для создания клиента
        select.append(createOption('Телефон'));
        select.append(createOption('Email'));
        select.append(createOption('Vk'));
        select.append(createOption('Facebook'));
        select.append(createOption('Другое'));
    } else { // если у нас форма для изменения клиента, мы ищем какой пункт выбран и добавляем его в выбранный пункт, остальные выводим в выпадющем меню
        let typeObj = {
            tel: 'Телефон',
            email: 'Email',
            Facebook: 'Facebook',
            other: 'Другое',
            Vk: 'Vk'
        }
        select.append(createOption(typeObj[selected]));
        delete typeObj[selected];
        for (key in typeObj) {
            select.append(createOption(typeObj[key]));

        }
    }
    return select;
}
// Функция для создания инпута 
function createInput(type) {

    const input = createDOMElement('input', 'add-contacts-input');
    input.setAttribute('placeholder', 'Введите данные контакта');

    if ((type === 'Телефон') || (type === 'tel')) {
        input.setAttribute('type', 'tel');
        input.setAttribute('name', 'tel');
        let im = new Inputmask("+7 (999)-999-99-99");
        im.mask(input);
    }
    if ((type === 'Другое') || (type === 'other')) {
        input.setAttribute('type', 'text');
        input.setAttribute('name', 'other');
    }
    if ((type === 'Email') || (type === 'email')) {
        input.setAttribute('type', 'email');
        input.setAttribute('name', 'email');
    }
    if ((type === 'Vk') || (type === 'vk')) {
        input.setAttribute('type', 'text');
        input.setAttribute('name', 'Vk');
    }
    if ((type === 'Facebook') || (type === 'facebook')) {
        input.setAttribute('type', 'text');
        input.setAttribute('name', 'Facebook');
    }
    return input;
}
// функция проверки объекта на пустоту
function isEmpty(obj) {
    for (let key in obj) {
        return false;
    }
    return true;
}
// функция для отрисовки селекта и импута так же заполняет значениями, если открывается форма Изменения клиента
function addSelectAndInput(list, contact = {}) {
    let input;


    // Добавляем стили контейнеру листа с селектами инпутами и кнопкой добавить
    if (isEmpty(contact)) {
        document.querySelector('.container-btn-list').classList.add('container-btn-list-active');
    }

    // Создаем контейнер для одного селекта и инпута
    const divContainer = createDOMElement('li', 'select-container');
    let select;

    // Создаем Селект
    if (isEmpty(contact)) {
        select = createSelect();

    } else {
        select = createSelect(contact.type);
    }

    divContainer.append(select);
    list.append(divContainer);
    new Choices(select, {
        itemSelectText: '',
        shouldSort: false,
        searchEnabled: false,
        searchChoices: false,

    });
    if (isEmpty(contact)) {
        input = createInput(select.value);
    } else {
        input = createInput(contact.type);
        input.value = contact.value;
    }
    input.addEventListener('keydown', function(key) {
        if (key.keyCode === 13) {
            key.preventDefault();
            //Ищем все созданные инпуты
            let allInput = document.querySelectorAll('.add-contacts-input');
            // Счетчик индекса
            let index = 0;
            // Перебераем до тех пор пока не найдем текущего инпута
            for (el of allInput) {
                index++;
                if (el === input) {
                    break;
                }
            }
            // Если у нас не последний инпут, то ставим фокус на следующий
            // Иначе даем фокус на кнопку сохранить
            if (index != allInput.length) {
                allInput[index].focus();
            } else {
                document.querySelector('.addperson-modal__btn-save').focus();

            }





        }
    })

    divContainer.append(input);
    const deleteBtn = createDOMElement('button', 'add-contacts-deletebtn');

    deleteBtn.addEventListener('click', function() {
        divContainer.remove();
        if (!document.querySelector('.select-container')) {
            document.querySelector('.container-btn-list').classList.remove('container-btn-list-active');
        }

        if (document.querySelectorAll('.select-container').length < 10) {
            document.querySelector('.addperson-modal__btn-add-contacts').style.display = 'inline-block';
        }
    });

    divContainer.append(deleteBtn);
    list.append(divContainer);


    if (document.querySelector('.select-container')) {
        if (document.querySelectorAll('.select-container').length === 10) {
            document.querySelector('.addperson-modal__btn-add-contacts').style.display = 'none';
        }
    }

    select.addEventListener('change', function() {
        input.remove();
        deleteBtn.remove();
        input = createInput(select.value);
        divContainer.append(input);
        divContainer.append(deleteBtn);
        deleteBtn.addEventListener('click', function() {
            divContainer.remove();

            if (!document.querySelector('.select-container')) {
                document.querySelector('.container-btn-list').classList.remove('container-btn-list-active');
            }

            if (document.querySelectorAll('.select-container').length < 10) {
                document.querySelector('.addperson-modal__btn-add-contacts').style.display = 'inline-block';
            }
        });
    });
}
// Функция для нахождения ошибки и вставки в форму
function findErrors(error, text) {
    const errorInput = document.querySelector(`input[name="${error}"]`);
    errorInput.classList.add('input-error');
    const container = document.querySelector('.addperson-modal__btn-save');
    const divContainerEror = createDOMElement('div', 'div-error');
    divContainerEror.textContent = text;
    const divError = document.querySelector('.div-error');
    if (divError) {
        divError.remove();
    }
    container.insertAdjacentElement('beforebegin', divContainerEror);
}
// Функция Debouncing
function debounce(f, t) {
    return function(args) {
        let previousCall = this.lastCall;
        this.lastCall = Date.now();
        if (previousCall && ((this.lastCall  -  previousCall) <= t)) {
            clearTimeout(this.lastCallTimer);
        }
        this.lastCallTimer = setTimeout(() => f(args), t);
    }
}
// функция запроса на сервер для создания нового клиента
async function createNewClient(surname, name, lastName = '', contacts) {
    const response = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            surname,
            lastName,
            contacts
        })
    });
    const data = await response.json();

    return {
        data,
        status: response.status,
    }
}
// Функция для запроса на сервер изменение клиента 
async function changeClient(id, surname, name, lastName = '', contacts) {
    await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            surname,
            lastName,
            contacts
        })
    });

}
// Функция для запроса на сервер определенного клиента
async function getClientInfo(id) {
    const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'GET',
    });
    return await response.json();
}
// функция для создания нового элемента с навешиванием класса
function createDOMElement(element, nameClass = '') {
    let newElement = document.createElement(element);
    if (nameClass != '') {
        newElement.classList.add(nameClass);
    }
    return newElement;
}
// Функция для удаления моадльного окна из DOM дерева
function closeModalWindow() {
    const modalWindow = document.querySelector('.addperson-modal');

    if (modalWindow.classList.contains('addperson-modal-active')) {
        modalWindow.classList.remove('addperson-modal-active');
    }
    document.querySelector('.modal__shadow').classList.remove('modal__shadow-active');
    setTimeout(function() {
        modalWindow.remove();
    }, 200);
}
// Функция для открытия модальных окон
function openModalWindow() {
    const modal = document.querySelector('.addperson-modal');
    modal.classList.add('addperson-modal-active');
    const shadow = document.querySelector('.modal__shadow');
    shadow.classList.add('modal__shadow-active');
}
async function deleteClient(id) {
    await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'DELETE',
    });
    closeModalWindow();
    const tableNow = document.querySelectorAll('.table__body-line');
    if (tableNow != 0) {
        tableNow.forEach(item => {
            item.remove();
        })
    }
    let data = await loadClientsInformation();
    if (data.length != 0) {
        for (let i = 0; i < data.length; i++) {
            createClientTable(data[i]);
        }
    }
}
// Функция для создания различных модальных окон взависимости от type 
async function createModalWindow(type, id = -1) {
    //Создаем контейнер для всей модалки
    let divContainerModal = createDOMElement('div', 'addperson-modal');
    divContainerModal.setAttribute('aria-hidden', 'true');
    // Создаем затемнение
    let modalShadow = createDOMElement('div', 'modal__shadow');
    divContainerModal.append(modalShadow);
    let modalWindow = createDOMElement('div', 'addperson-modal__window');
    let modalWrap = createDOMElement('div', 'addperson-modal__wrap');
    // Создаем кнопку крестика и при нажатии на него закрывается модальное окно
    let btnClose = createDOMElement('button', 'addperson-modal__btn-close');
    btnClose.addEventListener('click', function(e) {
        e.preventDefault();
        closeModalWindow();
    });
    modalWrap.append(btnClose);
    // Если модальное окно создания клиента
    if (type === 'New') {
        // Создаем заголовок
        let modalTitel = createDOMElement('h2', 'addperson-modal__title');
        modalTitel.textContent = 'Новый клиент';
        modalWrap.append(modalTitel);
        // Создаем форму 
        let modalForm = createDOMElement('form');
        // Создаем инпуты ФИО
        let modalInputFIOContainer = createDOMElement('div', 'addperson-modal__input-container');
        let modalInputSurname = createDOMElement('input', 'addperson-modal__input');
        modalInputSurname.setAttribute('placeholder', 'Фамилия*');
        modalInputSurname.setAttribute('name', 'surname');
        modalInputSurname.addEventListener('input', function() {
            if (modalInputSurname.classList.contains('input-error')) {
                modalInputSurname.classList.remove('input-error');
            }
        });

        let modalInputName = createDOMElement('input', 'addperson-modal__input');

        modalInputName.setAttribute('placeholder', 'Имя*');
        modalInputName.setAttribute('name', 'name');
        modalInputName.addEventListener('input', function() {
            if (modalInputName.classList.contains('input-error')) {
                modalInputName.classList.remove('input-error');
            }
        });

        let modalInputMidlename = createDOMElement('input', 'addperson-modal__input');
        modalInputMidlename.setAttribute('placeholder', 'Отчество');
        modalInputMidlename.setAttribute('name', 'midlename');
        modalInputFIOContainer.append(modalInputSurname);
        modalInputFIOContainer.append(modalInputName);
        modalInputFIOContainer.append(modalInputMidlename);
        modalForm.append(modalInputFIOContainer);
        // Создаем контейнер для селектов и кнопки их добавления
        let containerBtnAndList = createDOMElement('div', 'container-btn-list');
        // Создаем пустой ul для контактов
        let listOfContacts = createDOMElement('ul', 'addperson-modal__container-add-contacts');
        containerBtnAndList.append(listOfContacts);

        // Создаем кнопку добавить контакт
        let btnAddContact = createDOMElement('button', 'addperson-modal__btn-add-contacts');

        btnAddContact.textContent = 'Добавить контакт';
        btnAddContact.setAttribute('type', 'button');
        btnAddContact.addEventListener('click', function() {
            addSelectAndInput(listOfContacts);
        });

        containerBtnAndList.append(btnAddContact)
        modalForm.append(containerBtnAndList);
        // Создаем кнопку сохранить
        let btnSave = createDOMElement('button', 'addperson-modal__btn-save');
        btnSave.textContent = 'Сохранить';
        btnSave.setAttribute('type', 'submit');
        modalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const divLoader = createDOMElement('div', 'save-preloader');
            const saveLoader = createDOMElement('div', 'save-loader');

            divLoader.append(saveLoader);
            btnSave.append(divLoader);

            let objContacts = [];
            let i = 0;
            if (document.querySelector('.add-contacts-input')) {
                document.querySelectorAll('.add-contacts-input').forEach(item => {
                    if (item.value != '') {
                        let contact = {};
                        contact.type = item.getAttribute('name');
                        contact.value = item.value;
                        objContacts[i] = contact;
                        i++;
                    }

                })
            }
            let check = await createNewClient(modalInputSurname.value, modalInputName.value, modalInputMidlename.value, objContacts);
            if (check.status === 422) {
                divLoader.classList.add('save-done-load');
                setTimeout(function() {
                    divLoader.remove();
                }, 2000);
                findErrors(check.data.errors[0].field, check.data.errors[0].message);

            } else {
                if (document.querySelector('.div-error')) {
                    document.querySelector('.div-error').remove();
                }
                closeModalWindow();
                if (document.querySelector('.table__body-line')) {
                    document.querySelectorAll('.table__body-line').forEach(item => {
                        item.remove();
                    })
                }
                let data = await loadClientsInformation();
                if (data.length != 0) {
                    for (let i = 0; i < data.length; i++) {
                        createClientTable(data[i]);
                    }
                }
            }


        });
        modalForm.append(btnSave);
        // Создаем кнопку отмена
        let btnCancel = createDOMElement('button', 'addperson-modal__btn-cancel');

        btnCancel.textContent = 'Отмена';
        btnCancel.addEventListener('click', function(e) {
            e.preventDefault();
            closeModalWindow();
        });
        modalForm.append(btnCancel);
        modalWrap.append(modalForm);
        modalWindow.append(modalWrap);
        divContainerModal.append(modalWindow);
        document.body.append(divContainerModal);
    }
    if (type === 'Delete') {

        let modalTitel = createDOMElement('h2');
        modalTitel.classList.add('addperson-modal__title');
        modalTitel.textContent = 'Удалить клиента';
        modalTitel.style.margin = '0 auto 11px auto';
        modalWrap.append(modalTitel);

        const divDiscribe = createDOMElement('div', 'discribe-modal-text');

        divDiscribe.textContent = 'Вы действительно хотите удалить данного клиента?';
        modalWrap.append(divDiscribe);

        const btnProof = createDOMElement('button', 'addperson-modal__btn-save');

        btnProof.textContent = 'Удалить';
        //DELETE
        btnProof.addEventListener('click', async function() {
            deleteClient(id);

        })
        modalWrap.append(btnProof);

        let btnCancel = createDOMElement('button', 'addperson-modal__btn-cancel');

        btnCancel.textContent = 'Отмена';
        btnCancel.addEventListener('click', function(e) {
            e.preventDefault();
            closeModalWindow();
        });
        modalWrap.append(btnCancel);

        modalWindow.append(modalWrap);
        divContainerModal.append(modalWindow);
        document.body.append(divContainerModal);
    }
    if (type === 'Change') {
        const info = await getClientInfo(id);

        // Создаем заголовок
        const modalTitel = createDOMElement('h2', 'addperson-modal__title');

        modalTitel.textContent = 'Изменить данные';
        modalWrap.append(modalTitel);
        //Создаем блок для указания id
        const idBlock = createDOMElement('div', 'modal-change_id');

        idBlock.textContent = 'ID: ' + id;
        modalWrap.append(idBlock);
        // Создаем форму 
        let modalForm = createDOMElement('form');
        // Создаем инпуты ФИО
        let modalInputFIOContainer = createDOMElement('div', 'addperson-modal__input-container');


        let modalInputSurname = createDOMElement('input', 'addperson-modal__input');

        modalInputSurname.setAttribute('placeholder', 'Фамилия*');
        modalInputSurname.setAttribute('name', 'surname');
        modalInputSurname.value = info.surname;
        modalInputSurname.addEventListener('input', function() {
            if (modalInputSurname.classList.contains('input-error')) {
                modalInputSurname.classList.remove('input-error');
            }
        })

        let modalInputName = createDOMElement('input', 'addperson-modal__input');

        modalInputName.setAttribute('placeholder', 'Имя*');
        modalInputName.setAttribute('name', 'name');
        modalInputName.value = info.name;
        modalInputName.addEventListener('input', function() {
            if (modalInputName.classList.contains('input-error')) {
                modalInputName.classList.remove('input-error');
            }
        })

        let modalInputMidlename = createDOMElement('input', 'addperson-modal__input');

        modalInputMidlename.setAttribute('placeholder', 'Отчество');
        modalInputMidlename.setAttribute('name', 'midlename');
        modalInputMidlename.value = info.lastName;


        modalInputFIOContainer.append(modalInputSurname);
        modalInputFIOContainer.append(modalInputName);
        modalInputFIOContainer.append(modalInputMidlename);
        modalForm.append(modalInputFIOContainer);
        // Создаем контейнер для селектов и кнопки их добавления
        let containerBtnAndList = createDOMElement('div', 'container-btn-list');

        // Создаем пустой ul для контактов
        let listOfContacts = createDOMElement('ul', 'addperson-modal__container-add-contacts');


        if (info.contacts.length != 0) {
            containerBtnAndList.classList.add('container-btn-list-active');
            for (let i = 0; i < info.contacts.length; i++) {
                addSelectAndInput(listOfContacts, info.contacts[i])
            }
        }
        containerBtnAndList.append(listOfContacts);

        // Создаем кнопку добавить контакт
        let btnAddContact = createDOMElement('button', 'addperson-modal__btn-add-contacts');

        btnAddContact.textContent = 'Добавить контакт';
        btnAddContact.setAttribute('type', 'button');
        btnAddContact.addEventListener('click', function() {
            addSelectAndInput(listOfContacts);
        });

        containerBtnAndList.append(btnAddContact)
        modalForm.append(containerBtnAndList);
        // Создаем кнопку сохранить
        let btnSave = createDOMElement('button', 'addperson-modal__btn-save');

        btnSave.textContent = 'Сохранить';
        btnSave.setAttribute('type', 'submit');
        modalForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            let objContacts = [];
            let i = 0;
            if (document.querySelector('.add-contacts-input')) {

                document.querySelectorAll('.add-contacts-input').forEach(item => {
                    if (item.value != '') {
                        let contact = {};
                        contact.type = item.getAttribute('name');
                        contact.value = item.value;
                        objContacts[i] = contact;
                        i++;
                    }

                })
            }

            await changeClient(id, modalInputSurname.value, modalInputName.value, modalInputMidlename.value, objContacts);


            closeModalWindow();

            if (document.querySelector('.table__body-line')) {
                document.querySelectorAll('.table__body-line').forEach(item => {
                    item.remove();
                })
            }
            let data = await loadClientsInformation();
            if (data.length != 0) {
                for (let i = 0; i < data.length; i++) {
                    createClientTable(data[i]);
                }
            }



        })
        modalForm.append(btnSave);
        // Создаем кнопку DELETE
        let btnDelete = createDOMElement('button', 'addperson-modal__btn-cancel');

        btnDelete.textContent = 'Удалить клиента';
        btnDelete.addEventListener('click', async function(e) {
            e.preventDefault();
            deleteClient(id);
        });
        modalForm.append(btnDelete);
        modalWrap.append(modalForm);
        modalWindow.append(modalWrap);
        divContainerModal.append(modalWindow);
        document.body.append(divContainerModal);
    }
    //Закрытие окна, если кликнуть на оверлей
    window.addEventListener('click', function(event) {
        if (event.target.matches('.modal__shadow')) {
            closeModalWindow();
        }
    });
}
// Функция для создания модального окна для создания клиента и открытия модального окна после того, как модальное окно добавится в DOM дерево
function moadlAddPerson() {
    createModalWindow('New');
    setTimeout(openModalWindow, 200);
}
// Функция для вывода надписи, что клиентов нет
function emptyOrNotFounded(text) {
    // Находим тело таблицы 
    let tBody = document.querySelector('.table__body');
    // Создаем строку
    let tr = createDOMElement('tr', 'table__body-line');
    // Создаем ячейку 
    let td = createDOMElement('td', 'database-empty');
    // Делаем е на все ячейки таблицы 
    td.setAttribute('colspan', '6');
    // Добавляем надпись для вывода
    td.textContent = text;
    // Добавляем все в таблицу
    tr.append(td);
    tBody.append(tr);
}

async function SRMSystem() {
    // Получаем данные о клиентах
    let data = await loadClientsInformation();
    // Кнопка сортировки по ID
    let btnSortID = document.querySelector('.sort-id');
    btnSortID.addEventListener('click', function() {
        sortByID(btnSortID);
    });
    // Если у нас не пустая база с клиентами отрисовываем таблицу и добавляем и убираем заставку
    if (data.length != 0) {
        // Сортируем по ID
        sortByID(btnSortID);
    }
    // Если клиентов нет, то выводим надпись, что клиентов еще нет
    else {
        emptyOrNotFounded('База данных пуста');
    }
    // Находим кнопку создать клиента и вешаем на нее событие по click 
    document.querySelector('.content__add-btn').addEventListener('click', moadlAddPerson);

    // Конопка сортировки по ФИО
    let btnSortFIO = document.querySelector('.sort-FIO');
    btnSortFIO.addEventListener('click', function() {
        addPreloader();
        let activeSort = document.querySelector('.sort-active');
        if (activeSort) {
            activeSort.classList.remove('sort-active');
        }

        btnSortFIO.classList.add('sort-active');
        btnSortFIO.classList.add('sort-FIO');
        let sortData = sortByFIO();
        if ((btnSortFIO.classList.contains('sort-active')) && (!btnSortFIO.classList.contains('sort-increase'))) {
            let increaseSort = document.querySelector('.sort-increase');
            if (increaseSort) {
                increaseSort.classList.remove('sort-increase');
            }
            btnSortFIO.classList.add('sort-increase');
            btnSortFIO.classList.add('sort-FIO');
            btnSortFIO.classList.remove('sort-FIO-decrease');

        } else {
            sortData.reverse();
            btnSortFIO.classList.remove('sort-increase');
            btnSortFIO.classList.add('sort-FIO-decrease');
            btnSortFIO.classList.add('sort-active');
        }
        if (document.querySelectorAll('.table__body-line').length != 0) {
            document.querySelectorAll('.table__body-line').forEach(item => {
                item.remove();
            })
        }
        for (let i = 0; i < sortData.length; i++) {
            createClientTable(sortData[i]);
        }
        removePreloader();
    });
    // Кнопка сортировки по дате создания
    let btnSortCreateDate = document.querySelector('.sort-create');
    btnSortCreateDate.addEventListener('click', function() {
        let activeSort = document.querySelector('.sort-active');
        if (activeSort) {
            activeSort.classList.remove('sort-active');
        }
        addPreloader();
        btnSortCreateDate.classList.add('sort-active');
        btnSortCreateDate.classList.add('sort-create');
        let sortData = sortByCreateDate(activeData);
        if ((btnSortCreateDate.classList.contains('sort-active')) && (!btnSortCreateDate.classList.contains('sort-increase'))) {
            let increaseSort = document.querySelector('.sort-increase');
            if (increaseSort) {
                increaseSort.classList.remove('sort-increase');
            }
            sortData.reverse();
            btnSortCreateDate.classList.add('sort-increase');
            btnSortCreateDate.classList.add('sort-create');
            btnSortCreateDate.classList.remove('sort-create-decrease');

        } else {
            btnSortCreateDate.classList.remove('sort-increase');
            btnSortCreateDate.classList.add('sort-create-decrease');
            btnSortCreateDate.classList.remove('sort-active');
        }
        if (document.querySelectorAll('.table__body-line').length != 0) {
            document.querySelectorAll('.table__body-line').forEach(item => {
                item.remove();
            })
        }
        for (let i = 0; i < sortData.length; i++) {
            createClientTable(sortData[i]);
        }
        removePreloader();
    });
    // Кнопка сортировки по дате изменения
    let btnSortChangeDate = document.querySelector('.sort-change');
    btnSortChangeDate.addEventListener('click', function() {
        addPreloader();
        let activeSort = document.querySelector('.sort-active');
        if (activeSort) {
            activeSort.classList.remove('sort-active');
        }

        btnSortChangeDate.classList.add('sort-active');
        btnSortChangeDate.classList.add('sort-change');
        let sortData = sortByChangeDate(activeData);
        if ((btnSortChangeDate.classList.contains('sort-active')) && (!btnSortChangeDate.classList.contains('sort-increase'))) {
            let increaseSort = document.querySelector('.sort-increase');
            if (increaseSort) {
                increaseSort.classList.remove('sort-increase');
            }
            sortData.reverse();
            btnSortChangeDate.classList.add('sort-increase');
            btnSortChangeDate.classList.remove('sort-change');
            btnSortChangeDate.classList.add('sort-change-decrease');

        } else {
            btnSortChangeDate.classList.remove('sort-increase');
            btnSortChangeDate.classList.remove('sort-change-decrease');
            btnSortChangeDate.classList.add('sort-active');
        }

        if (document.querySelectorAll('.table__body-line').length != 0) {
            document.querySelectorAll('.table__body-line').forEach(item => {
                item.remove();
            })
        }
        for (let i = 0; i < sortData.length; i++) {
            createClientTable(sortData[i]);
        }
        removePreloader();
    });
    const inputSerach = document.querySelector('.header__input');
    const debounceSearchClient = debounce(getContent, 300);
    inputSerach.addEventListener('input', debounceSearchClient);

}

document.addEventListener('DOMContentLoaded', SRMSystem());