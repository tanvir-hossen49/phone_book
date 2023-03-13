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
  const addBtn = document.getElementById("add-btn");
  const closeBtn = document.getElementById("close-btn");
  const tableBody = document.getElementById("table-body");
  const form = document.getElementById("modal");

  //event listener
  addBtn.addEventListener("click", () => {
    showModal();

    document.getElementById("modal-btns").innerHTML = `
      <button type ="submit" id="save-btn" onclick='getAndSetValue()'> Save </button>
    `;
  });
  closeBtn.addEventListener("click", hideModal);
  tableBody.addEventListener("click", showModalData);
  form.addEventListener("submit", (e) => e.preventDefault());
}

//----------------FETCH DATA-----------------
async function loadJSON() {
  const response = await fetch("app/countries.json");
  const data = await response.json();
  generateCountryOption(data);
}

//---------------EVENT HANDLER---------------
function showModal() {
  const form = document.getElementById("modal");
  const fullScreenDiv = document.getElementById("fullscreen-div");
  fullScreenDiv.style.display = "block";
  form.style.display = "block";
}
function hideModal() {
  const form = document.getElementById("modal");
  const fullScreenDiv = document.getElementById("fullscreen-div");
  fullScreenDiv.style.display = "none";
  form.style.display = "none";
  form.reset();
}
function getAndSetValue() {
  if (!formInputValue()) return;

  let person = {
    id: phoneBook.length + 1,
    ...formInputValue(),
  };

  if (phoneBook) {
    phoneBook.push(person);
  }

  setLocalStorage("phoneBook", phoneBook);
  hideModal();
  showContactList();
}
function showModalData(event) {
  showModal();

  const selectedId =
    event.target.parentElement.children[0].getAttribute("data-id");

  const targetedObj = phoneBook.find((item) => item.id == Number(selectedId));

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
  document.getElementById("modal-btns").innerHTML = `
    <button type = "submit" id="update-btn" onclick='updateContact(${id})'>Update </button>
    <button type = "button" id="delete-btn" onclick='deleteData(${id})'>Delete </button>
  `;
}
function updateContact(id) {
  let index = phoneBook.findIndex((item) => item.id === id);

  if (!formInputValue()) return;

  phoneBook[index] = {
    id: id,
    ...formInputValue(),
  };

  setLocalStorage("phoneBook", phoneBook);
  showContactList();
  hideModal();
}
function deleteData(id) {
  const index = phoneBook.findIndex((item) => item.id === id);
  phoneBook.splice(index, 1);

  setLocalStorage("phoneBook", phoneBook);
  showContactList();
  hideModal();
}

//---------------DOM FUNCTION---------------
function generateCountryOption(data) {
  const countryList = document.getElementById("country-list");
  countryList.innerHTML += data.map((country) => {
    return `
      <option>${country.country}</option>
    `;
  });
}
function showContactList() {
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
}

//---------------UTILITIES---------------
function formInputRef() {
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
}
function formInputValue() {
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
}
function setLocalStorage(name, value) {
  localStorage.setItem(name, JSON.stringify(value));
}
function isEmail(emailAddress) {
  let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (emailAddress.match(regex)) return true;
  else return false;
}
function isValidPhone(phoneNumber) {
  var found = phoneNumber.search(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  );
  if (found > -1) {
    return true;
  }
  return false;
}
