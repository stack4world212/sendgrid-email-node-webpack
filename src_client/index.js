const btnSend = document.querySelector('#submit');

btnSend.addEventListener('click', evt => {

  const xhr = new XMLHttpRequest();
  const successAlert = document.querySelector('#success-alert');
  const failAlert = document.querySelector('#fail-alert');
  successAlert.textContent = '';
  failAlert.textContent = '';

  xhr.addEventListener('load', evt => {

    if (xhr.status == 200) {
      // const result = JSON.parse(xhr.response);
      console.log('result',xhr.response);
      if(xhr.response == 'success') {
        successAlert.textContent = 'Success!';
      }
      else if(xhr.response == 'fail') {
        failAlert.textContent = 'Fail!';
      }
    }
  });

  xhr.addEventListener('error', evt => {
    console.error(evt);
  });

  xhr.open('post', 'sendemail', true);

  const formEle = document.querySelector('#myform');
  const formData = new FormData(formEle);

  xhr.send(formData);

});



