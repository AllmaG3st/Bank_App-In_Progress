'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');



// Display Transactions

const displayMovements = (movements, sort = false) => {

  containerMovements.innerHTML = '';

  const movs = sort ? [...movements].sort((a, b) => a - b) : movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `
    containerMovements.insertAdjacentHTML('afterbegin', html);
  })
}

// Create UserNames for Users
const createUserName = (accs) => {
  accs.forEach(acc => {
    acc.userName = acc.owner
      .toLocaleLowerCase()
      .split(' ')
      .map((e) => e[0])
      .join('')
  });
};
createUserName(accounts);

// Calculate account balance

const calcPrintBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, el) => acc + el);
  labelBalance.textContent = `${acc.balance.toFixed(2)}`;
};

// Calculate Summary

const calcDisplaySummary = (acc) => {
  const incomes = acc.movements.filter(el => el > 0).reduce((acc, el) => acc + el);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements.filter(el => el < 0).reduce((acc, el) => acc + el);
  labelSumOut.textContent = `${Math.abs(out.toFixed(2))}€`

  const interest = acc.movements.filter(el => el > 0).filter(e => e * acc.interestRate > 1).reduce((sum, el) => sum + el * acc.interestRate / 100, 0)
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}

const updateUI = (acc) => {
  //Display movements
  displayMovements(acc.movements);

  //Display balance
  calcPrintBalance(acc);

  //Display summary
  calcDisplaySummary(acc);
}

//! Login

let currentAccount;

btnLogin.addEventListener('click', (e) => {
  e.preventDefault();
  currentAccount = accounts.find(acc => acc.userName === inputLoginUsername.value);
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI 
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome Back, ${currentAccount.owner.split(' ')[0]}`;
    labelWelcome.style.color = '#444';
    updateUI(currentAccount);
  } else {
    labelWelcome.textContent = `Password or username are not correct`;
    labelWelcome.style.color = 'red';
  }

  inputLoginUsername.value = inputLoginPin.value = '';

  inputLoginPin.blur();
});

//! Transfer

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(acc => acc.userName === inputTransferTo.value);
  const div = document.querySelector('.operation--transfer');
  const error = `
      <div class='error' style="color:red" >Wrong user or amount</div>
    `

  //Checking Transfer validity
  if (amount > 0 && currentAccount.balance >= amount && receiverAccount && receiverAccount?.userName !== currentAccount.userName) {
    document.querySelector('.error')?.remove();
    //Transfer itself
    console.log('valid');
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    updateUI(currentAccount);
  } else {
    div.insertAdjacentHTML('afterbegin', error)
  }

  inputTransferAmount.value = inputTransferTo.value = '';

})

//! Delete The account

btnClose.addEventListener('click', (e) => {

  e.preventDefault();

  const div = document.querySelector('.operation--close');
  const error = `
      <div class='error' style="color:yellow" >Password or username are not correct</div>
    `;

  //Check if credentials are correct
  if (currentAccount.userName === inputCloseUsername.value && currentAccount.pin === +inputClosePin.value) {
    document.querySelector('.error')?.remove();
    const index = accounts.find(acc => acc.userName === currentAccount.userName);
    //HideUI 
    containerApp.style.opacity = 0;
    //Delete The account
    accounts.splice(index, 1);
    //Show message
    labelWelcome.textContent = `Hope to see you again, ${currentAccount.owner.split(' ')[0]}`;
  } else {
    div.insertAdjacentHTML('afterbegin', error)
  }

  inputCloseUsername.value = inputClosePin.value = '';
})


//! Request Loan

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();

  const div = document.querySelector('.operation--loan');
  const error = `
      <div class='error' style="color:red" >Bank can't provide this loan</div>
    `;

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * .1)) {
    //Add loan
    document.querySelector('.error')?.remove();
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  } else {
    //Add error
    div.insertAdjacentHTML('afterbegin', error);
  }

  inputLoanAmount.value = '';
});

//! Sorting

let sorted = false;
btnSort.addEventListener('click', (e) => {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

