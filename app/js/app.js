/**
 * Date: 12-03-2023
 * Author: Golam Aziz
 * Description: In this application you can save your contact number and address
 */

//----------------GLOBAL VARIABLES-----------------
let phoneBook = JSON.parse(localStorage.getItem("phoneBook")) || [];

const firstNameInputEle = document.getElementById("first-name"),
  lastNameInputEle = document.getElementById("last-name"),
  emailInputEle = document.getElementById("email"),
  phoneInputEle = document.getElementById("phone-number"),
  upazilaInputEle = document.getElementById("upazila-list"),
  districtInputEle = document.getElementById("district-list");

//----------------ON LOAD HANDLER-----------------
window.onload = () => {
  main();
  loadDistrictData();
  displayContractList();
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
    howToUseCloseBtn = document.getElementById("how-to-use-close-btn"),
    sortByDate = document.getElementById("sort-by-date"),
    districtList = document.getElementById("district-list");

  //event listener
  addBtn.addEventListener("click", () => {
    showModal("modal");
    showStorageInModal(arraySize);
    modalBtn.innerHTML = `
      <button type ="submit" id="save-btn" onclick='createContact()'> Save </button>
    `;
  });
  closeBtn.addEventListener("click", () => {
    hideModal("modal");
  });
  tableBody.addEventListener("dblclick", event => {
    displayModalData(event, modalBtn);
  });
  modal.addEventListener("submit", e => e.preventDefault());
  howToUseBtn.addEventListener("click", () => {
    showModal("help-modal");
  });
  howToUseCloseBtn.addEventListener("click", () => {
    hideModal("help-modal");
  });
  search.addEventListener("keyup", searchName);
  sortByDate.addEventListener("change", e => {
    if (e.target.value === "ascending") {
      sortContact((a, b) => {
        return new Date(a.date).valueOf() - new Date(b.date).valueOf();
      });
    } else {
      sortContact((a, b) => {
        return b.date - a.date;
      });
    }
  });
  districtList.addEventListener("change", async function (e) {
    //get districtId to html attribute
    const districtId = await getDistrictId(e.target.value);

    loadUpazilasData(districtId);
  });
}

//----------------FETCH DATA-----------------
const loadDistrictData = async () => {
  const response = await fetch("app/json/districts.json");
  const data = await response.json();

  let newArray = data.reduce((acc, curr) => {
    acc.push({
      name: curr.name,
      id: curr.id,
    });
    return acc;
  }, []);

  createDistrictDropdown(newArray);
};
const loadUpazilasData = async districtId => {
  const response = await fetch("app/json/upazilas.json");
  const data = await response.json();
  const upazilaList = data.filter(data => data.district_id === districtId);
  createUpazilaDropdown(upazilaList);
};
const getDistrictId = async districtName => {
  const response = await fetch("app/json/districts.json");
  const data = await response.json();

  const districtId = data.find(
    data => data.name.toLowerCase() === districtName.toLowerCase()
  );

  return districtId.id;
};

//---------------EVENT HANDLER---------------
const showModal = id => {
  const modal = document.getElementById(id);
  const fullScreenDiv = document.getElementById("fullscreen-div");
  fullScreenDiv.style.display = "block";
  modal.style.display = "block";
};
const hideModal = id => {
  const modal = document.getElementById(id);
  const fullScreenDiv = document.getElementById("fullscreen-div");
  fullScreenDiv.style.display = "none";
  modal.style.display = "none";
  if (id === "modal") {
    modal.reset();
  }
};
const createContact = () => {
  if (!formInputValue()) return;

  let time = new Date();
  let day = time.getDate();
  let month = time.getMonth();
  let year = time.getFullYear();

  let person = {
    id: generateId(),
    date: `${month + 1}/${day}/${year}`,
    ...formInputValue(),
  };

  if (phoneBook) {
    phoneBook.push(person);
  }

  setLocalStorage("phoneBook", phoneBook);
  hideModal("modal");
  displayContractList();
};
const displayModalData = (event, modalBtn) => {
  showModal("modal");

  const selectedId =
    event.target.parentElement.children[0].getAttribute("data-id");

  const targetedObj = phoneBook.find(item => item.id === selectedId);

  let { id, firstName, lastName, email, phone, district, upazila } =
    targetedObj;

  // replace value
  firstNameInputEle.value = firstName;
  lastNameInputEle.value = lastName;
  emailInputEle.value = email;
  phoneInputEle.value = phone;
  districtInputEle.value = district;
  upazilaInputEle.value = upazila;

  document.getElementById("modal-title").innerHTML = "Change Contact Details";
  modalBtn.innerHTML = `
    <button type = "submit" id="update-btn" onclick='updateContact("${id}")'>Update </button>
    <button type = "button" id="delete-btn" onclick='deleteContact("${id}")'>Delete </button>
  `;
};
const updateContact = id => {
  let index = phoneBook.findIndex(item => item.id == id);

  if (!formInputValue()) return;
  phoneBook[index] = {
    ...phoneBook[index],
    ...formInputValue(),
  };

  setLocalStorage("phoneBook", phoneBook);
  displayContractList();
  hideModal("modal");
};
const deleteContact = id => {
  const index = phoneBook.findIndex(item => item.id === id);
  phoneBook.splice(index, 1);

  setLocalStorage("phoneBook", phoneBook);
  displayContractList();
  hideModal("modal");
};
const searchName = e => {
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
const sortContact = callBack => {
  if (phoneBook.length === 0) return;

  phoneBook.sort(callBack);

  console.log("phoneBook", phoneBook);
  displayContractList();
};

//---------------DOM FUNCTION---------------
const createDistrictDropdown = data => {
  const districtList = document.getElementById("district-list");
  districtList.innerHTML += data
    .map(district => {
      return `
      <option value='${district.name.toLowerCase()}' --data-district-id='${
        district.id
      }'>${district.name}</option>
    `;
    })
    .join("");
};
const createUpazilaDropdown = data => {
  const upazilaList = document.getElementById("upazila-list");

  upazilaList.innerHTML = "";

  upazilaList.innerHTML += data
    .map(upazila => {
      return `
      <option value='${upazila.name}'>${upazila.name}</option>
    `;
    })
    .join("");
};
const displayContractList = () => {
  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = "";

  phoneBook.forEach((element, index) => {
    let { id, firstName, lastName, email, phone, date, district, upazila } =
      element;
    tableBody.innerHTML += `
        <tr>
          <td data-id='${id}'>${++index}</td>
          <td>${firstName} ${lastName}</td>
          <td>${upazila}, ${district}</td>
          <td>${phone}</td>
          <td>${email}</td>
          <td>${date}</td>
        </tr>
      `;
  });
};
const showStorageInModal = arraySize => {
  let phoneBookSize = new Blob([JSON.stringify(phoneBook)]).size;
  arraySize.innerText = phoneBookSize / 1000 + "KB";
};

//---------------UTILITIES---------------
const formInputValue = () => {
  let obj = {
    firstName: firstNameInputEle.value,
    lastName: lastNameInputEle.value,
    email: emailInputEle.value,
    phone: phoneInputEle.value,
    district: districtInputEle.value,
    upazila: upazilaInputEle.value,
  };

  let { firstName, lastName, email, phone, district, upazila } = obj;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !district ||
    !upazila ||
    !isValidEmail(email) ||
    !isValidPhone(phone)
  ) {
    return false;
  }

  return {
    ...obj,
  };
};
const setLocalStorage = (name, value) => {
  localStorage.setItem(name, JSON.stringify(value));
};
const isValidEmail = emailAddress => {
  let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (emailAddress.match(regex)) return true;
  else return false;
};
const isValidPhone = phoneNumber => {
  var found = phoneNumber.search(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  );
  if (found > -1) {
    return true;
  }
  return false;
};
const generateId = () => Math.random().toString(36).substr(2, 9);
