$(function () {
  //   $.validator.setDefaults({
  //     submitHandler: function () {
  //       alert( "Form successful submitted!" );
  //     }
  //   });
  $('#loginForm').validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      email: {
        required: "Please enter a email address",
        email: "Please enter a vaild email address"
      },
      password: {
        required: "Please provide a password",
        minlength: "Your password must be at least 6 characters long"
      }
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.input-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    }
  });

  $("#agent-register-form").validate({
    rules: {
      name: {
        required: true
      },
      email: {
        required: true,
        email: true,
      },
      mobile: {
        required: true,
        number: true,
        minlength: 10,
        maxlength: 10
      },
      password: {
        required: true,
        minlength: 6
      },
      confirmPassword: {
        equalTo: "#password"
      },
      agreeTerms: {
        required: true
      }
    },
    messages: {
      name: {
        required: "Please enter full name"
      },
      email: {
        required: "Please enter email address",
        email: "Please enter vaild email address"
      },
      mobile: {
        required: "Please enter mobile number",
        number: "Mobile number must be in numeric",
        minlength: "Mobile number must be in 10 digit",
        maxlength: "Mobile number must be in 10 digit"
      },
      password: {
        required: "Please enter password",
        minlength: "Your password must be at least 6 characters long"
      },
      confirmPassword: {
        equalTo: "Password and confirm password should be equal"
      },
      agreeTerms: {
        required: "Please check the terms policy"
      }
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.input-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    }
  })

  $("#agent-forgot-password").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
    },
    messages: {
      email: {
        required: "Please enter email address",
        email: "Please enter vaild email address"
      },
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.input-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    }
  })

  $("#agent-reset-password").validate({
    rules: {
      password: {
        required: true,
        minlength: 6
      },
      confirmPassword: {
        equalTo: "#password"
      },
    },
    messages: {
      password: {
        required: "Please enter password",
        minlength: "Your password must be at least 6 characters long"
      },
      confirmPassword: {
        equalTo: "Password and confirm password should be equal"
      },
    },
    errorElement: 'span',
    errorPlacement: function (error, element) {
      error.addClass('invalid-feedback');
      element.closest('.input-group').append(error);
    },
    highlight: function (element, errorClass, validClass) {
      $(element).addClass('is-invalid');
    },
    unhighlight: function (element, errorClass, validClass) {
      $(element).removeClass('is-invalid');
    }
  })
});