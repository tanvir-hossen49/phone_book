/**
 * Date: 12-03-2023
 * Author: Golam Aziz
 * Description: In this application you can save your contact number and address
 */

//----------------GLOBAL VARIABLES-----------------
let phoneBook = JSON.parse(localStorage.getItem("phoneBook")) || [];

//----------------ON LOAD HANDLER-----------------
window.onload = () => {
  main();
  loadJSON();
  showContactList();
};

//----------------BOOT FUNCTION-----------------
function main() {
  //dom reference
  const addBtn = document.getElementById("add-btn"),
    closeBtn = document.getElementById("close-btn"),
    tableBody = document.getElementById("table-body"),
    modal = document.getElementById("modal"),
    modalBtn = document.getElementById("modal-btns"),
    search = document.getElementById("search"),
    arraySize = document.getElementById("size"),
    howToUseBtn = document.getElementById("how-to-use-btn"),
    helpCloseBtn = document.getElementById("help-close-btn");

  //event listener
  addBtn.addEventListener("click", () => {
    showModal("modal");
    getStorage(arraySize);
    modalBtn.innerHTML = `
      <button type ="submit" id="save-btn" onclick='getAndSetValue()'> Save </button>
    `;
  });
  closeBtn.addEventListener("click", () => {
    hideModal("modal");
  });
  tableBody.addEventListener("dblclick", (event) => {
    showModalData(event, modalBtn);
  });
  modal.addEventListener("submit", (e) => e.preventDefault());
  howToUseBtn.addEventListener("click", () => {
    showModal("help-modal");
  });
  helpCloseBtn.addEventListener("click", () => {
    hideModal("help-modal");
  });
  search.addEventListener("keyup", searchName);
}
//----------------FETCH DATA-----------------
async function loadJSON() {
  const response = await fetch("app/countries.json");
  const data = await response.json();
  generateCountryOption(data);
}

//---------------EVENT HANDLER---------------
const showModal = (id) => {
  const modal = document.getElementById(id);
  const fullScreenDiv = document.getElementById("fullscreen-div");
  fullScreenDiv.style.display = "block";
  modal.style.display = "block";
};
const hideModal = (id) => {
  const modal = document.getElementById(id);
  const fullScreenDiv = document.getElementById("fullscreen-div");
  fullScreenDiv.style.display = "none";
  if (id === "modal") {
    modal.style.display = "none";
    modal.reset();
  }
};
const getAndSetValue = () => {
  if (!formInputValue()) return;

  let person = {
    id: generateId(),
    ...formInputValue(),
  };

  if (phoneBook) {
    phoneBook.push(person);
  }

  setLocalStorage("phoneBook", phoneBook);
  hideModal("modal");
  showContactList();
};
const showModalData = (event, modalBtn) => {
  showModal("modal");

  const selectedId =
    event.target.parentElement.children[0].getAttribute("data-id");

  const targetedObj = phoneBook.find((item) => item.id === selectedId);

  let { id, firstName, lastName, email, phone, address, country } = targetedObj;

  let { firstNameEl, lastNameEl, emailEl, phoneEl, addressEl, countryEl } =
    formInputRef();

  // replace value
  firstNameEl.value = firstName;
  lastNameEl.value = lastName;
  emailEl.value = email;
  phoneEl.value = phone;
  addressEl.value = address;
  countryEl.value = country;

  document.getElementById("modal-title").innerHTML = "Change Contact Details";
  modalBtn.innerHTML = `
    <button type = "submit" id="update-btn" onclick='updateContact("${id}")'>Update </button>
    <button type = "button" id="delete-btn" onclick='deleteData("${id}")'>Delete </button>
  `;
};
const updateContact = (id) => {
  let index = phoneBook.findIndex((item) => item.id == id);

  if (!formInputValue()) return;

  phoneBook[index] = {
    id: id,
    ...formInputValue(),
  };

  setLocalStorage("phoneBook", phoneBook);
  showContactList();
  hideModal("modal");
};
const deleteData = (id) => {
  const index = phoneBook.findIndex((item) => item.id === id);
  phoneBook.splice(index, 1);

  setLocalStorage("phoneBook", phoneBook);
  showContactList();
  hideModal("modal");
};
const searchName = (e) => {
  let inputValue = e.target.value.toLowerCase();

  const tableBody = document.getElementById("table-body");
  const tableRows = tableBody.querySelectorAll("tr");

  tableRows.forEach((row, i) => {
    const td = row.getElementsByTagName("td")[1];

    if (td) {
      let text = td.innerHTML || td.textContent;

      if (text.toLowerCase().indexOf(inputValue) > -1) {
        tableRows[i].style.display = "";
      } else {
        tableRows[i].style.display = "none";
      }
    }
  });
};

//---------------DOM FUNCTION---------------
const generateCountryOption = (data) => {
  const countryList = document.getElementById("country-list");
  countryList.innerHTML += data.map((country) => {
    return `
      <option>${country.country}</option>
    `;
  });
};
const showContactList = () => {
  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = "";

  phoneBook.forEach((element, index) => {
    let { id, firstName, lastName, email, phone, address } = element;
    tableBody.innerHTML += `
        <tr>
          <td data-id='${id}'>${++index}</td>
          <td>${firstName} ${lastName}</td>
          <td>${address}</td>
          <td>${phone}</td>
          <td>${email}</td>
        </tr>
      `;
  });
};
const getStorage = (arraySize) => {
  let phoneBookSize = new Blob([JSON.stringify(phoneBook)]).size;
  arraySize.innerText = phoneBookSize / 1000 + "KB";
};

//---------------UTILITIES---------------
const formInputRef = () => {
  const firstNameEl = document.getElementById("first-name"),
    lastNameEl = document.getElementById("last-name"),
    emailEl = document.getElementById("email"),
    phoneEl = document.getElementById("phone-number"),
    addressEl = document.getElementById("address"),
    countryEl = document.getElementById("country-list");

  return {
    firstNameEl,
    lastNameEl,
    emailEl,
    phoneEl,
    addressEl,
    countryEl,
  };
};
const formInputValue = () => {
  let { firstNameEl, lastNameEl, emailEl, phoneEl, addressEl, countryEl } =
    formInputRef();

  let obj = {
    firstName: firstNameEl.value,
    lastName: lastNameEl.value,
    email: emailEl.value,
    phone: phoneEl.value,
    address: addressEl.value,
    country: countryEl.value,
  };

  let { firstName, lastName, email, phone } = obj;

  if (!obj.firstName || !obj.lastName || !email || !phone || !obj.address) {
    return false;
  }

  if (!isEmail(email) || !isValidPhone(phone)) {
    return false;
  }

  return {
    ...obj,
  };
};
const setLocalStorage = (name, value) => {
  localStorage.setItem(name, JSON.stringify(value));
};
const isEmail = (emailAddress) => {
  let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (emailAddress.match(regex)) return true;
  else return false;
};
const isValidPhone = (phoneNumber) => {
  var found = phoneNumber.search(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  );
  if (found > -1) {
    return true;
  }
  return false;
};
const generateId = () => Math.random().toString(36).substr(2, 9);
