function createDOMElement(element, nameClass = '') {
    let newElement = document.createElement(element);
    if (nameClass != '') {
        newElement.classList.add(nameClass);
    }
    return newElement;
}
async function getClientInfo(id) {
    const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'GET',
    });
    return await response.json();
}

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

function isEmpty(obj) {
    for (let key in obj) {
        return false;
    }
    return true;
}

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

function createOption(value) {
    const option = createDOMElement('option');
    option.setAttribute('value', value);
    option.textContent = value;
    return (option);
}

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
async function changeForm(id) {
    //Создаем контейнер для всей модалки
    let divContainerModal = createDOMElement('div', 'addperson-modal');
    divContainerModal.classList.add('addperson-modal-active');

    // Создаем затемнение
    let modalShadow = createDOMElement('div', 'modal__shadow');
    modalShadow.classList.add('modal__shadow-active');
    divContainerModal.append(modalShadow);
    let modalWindow = createDOMElement('div', 'addperson-modal__window');
    let modalWrap = createDOMElement('div', 'addperson-modal__wrap');

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

    modalWrap.append(modalForm);
    modalWindow.append(modalWrap);
    divContainerModal.append(modalWindow);
    document.body.append(divContainerModal);
}

async function PersonPage() {

    let url = location.search.replace("?id", "");


    data = await getClientInfo(url);

    await changeForm(url)
}
PersonPage();