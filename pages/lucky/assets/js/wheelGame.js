$(document).ready(function () {

  const params = new URLSearchParams(window.location.search);
  const lane = params.get("lane") || "Sheet1";

  var clicked = false;
  var isFilled = false;
  let formPayload = null;
  var winAudio = new Audio("./assets/voices/win.wav");
  let value = 0;

  let Training_industry = ["Kế toán", "QT kinh doanh", "QT văn phòng (Thư ký y khoa)",
    "Logistics", "QT Marketing", "Quan hệ công chúng", "Tài chính - ngân hàng", "Ô tô", "Cơ khí", "Xây dựng", "Điện - Điện Tử - Điện lạnh",
    "Thiết kế đồ họa", "Lập trình ứng dụng", "Truyền thông đa phương tiện", "Truyền thông mạng máy tính", "Dược Sĩ", "Y sĩ đa khoa", "Điều dưỡng", "Chăm sóc sắc đẹp", "Hộ sinh", "Xét nghiệm",
    "Biên phiên dịch", "Tiếng anh thương mai", "QT khách sạn", "Du lịch & lữ hành", "NV nhà hàng - khách sạn", "Sư phạm mầm non", "Giáo dục mầm non", "Tiếng anh sư phạm"
  ];

  // Lấy thẻ select
  let selectElement = document.getElementById("Training_industry");

  // Thêm các option từ mảng vào select
  Training_industry.forEach(function (Training_industry) {
    let option = document.createElement("option");
    option.value = Training_industry.toLowerCase(); // Giá trị sẽ là chữ thường (apple, banana...)
    option.textContent = Training_industry; // Hiển thị tên trái cây
    selectElement.appendChild(option); // Thêm option vào select
  });

  let notebookStock = 0;
  let tshirtStock = 0;
  let keychainStock = 0;

  function showNotify(message) {
    const div = document.createElement("div");
    div.innerText = message;

    div.style.position = "fixed";
    div.style.top = "20px";
    div.style.right = "20px";
    div.style.background = "#ff4d4f";
    div.style.color = "#fff";
    div.style.padding = "10px 15px";
    div.style.borderRadius = "5px";
    div.style.zIndex = 9999;

    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 3000);
  }

  const db = firebase.firestore();

  // NOTEBOOK
  async function loadStock() {
    try {
      const [notebookDoc, tshirtDoc, keychainDoc] = await Promise.all([
        db.collection("rewards").doc("notebook").get(),
        db.collection("rewards").doc("tshirt").get(),
        db.collection("rewards").doc("keychain").get()
      ]);

      notebookStock = notebookDoc.data()?.notebookStock || 0;
      tshirtStock = tshirtDoc.data()?.tshirtStock || 0;
      keychainStock = keychainDoc.data()?.keychainStock || 0;

      console.log("Stock loaded:", {
        notebookStock,
        tshirtStock,
        keychainStock
      });

    } catch (err) {
      console.error("Load stock failed:", err);
    }
  }

  // 👉 load 1 lần khi vào web
  loadStock();

  /* =============================
     🔽 DECREASE STOCK (GIỮ NGUYÊN)
  ============================= */
  function decreaseStock(docName, fieldName, callback) {

    const ref = db.collection("rewards").doc(docName);

    db.runTransaction(async (transaction) => {

      const doc = await transaction.get(ref);

      if (!doc.exists) throw "Document does not exist!";

      const currentStock = doc.data()[fieldName];

      if (currentStock > 0) {
        transaction.update(ref, {
          [fieldName]: currentStock - 1
        });
        return true;
      } else {
        return false;
      }

    }).then((success) => {

      // 🔥 update local luôn (khỏi cần realtime)
      if (success) {
        if (docName === "notebook") notebookStock--;
        if (docName === "tshirt") tshirtStock--;
        if (docName === "keychain") keychainStock--;
      }

      callback(success);

    }).catch((error) => {
      console.error(error);
      callback(false);
    });
  }

  /* =============================
     🎯 SPIN
  ============================= */
  function spinWheel() {

    let rand = Math.random();
    let targetAngle;

    function rotate(angle) {
      let baseRotation = (Math.floor(Math.random() * 5) + 6) * 360;
      let final = baseRotation + angle;

      $(".wheel__inner").css({
        transition: "cubic-bezier(0.19,1,0.22,1) 5s",
        transform: `rotate(${final}deg)`
      });

      setTimeout(() => {
        getPosition(angle);
      }, 5000);
    }

    if (notebookStock > 0 && rand < 0.02) {
      decreaseStock("notebook", "notebookStock", (success) => {
        targetAngle = success
          ? 148.5 + Math.random() * 50
          : Math.random() * 22.5;
        rotate(targetAngle);
      });
      return;
    }

    if (tshirtStock > 0 && rand < 0.04) {
      decreaseStock("tshirt", "tshirtStock", (success) => {
        targetAngle = success
          ? 202.5 + Math.random() * 40
          : Math.random() * 22.5;
        rotate(targetAngle);
      });
      return;
    }

    if (keychainStock > 0 && rand < 0.06) {
      decreaseStock("keychain", "keychainStock", (success) => {
        targetAngle = success
          ? 292.5 + Math.random() * 40
          : Math.random() * 22.5;
        rotate(targetAngle);
      });
      return;
    }

    // ❌ trượt
    targetAngle = Math.random() < 0.5
      ? Math.random() * 22.5
      : 337.5 + Math.random() * 22.5;

    rotate(targetAngle);
  }

  /* =============================
     🎯 HIỂN THỊ KẾT QUẢ
  ============================= */

  function getPosition(position) {

    let rewardText = "";
    let code = "";
    let descriptionText = "";

    // CUỐN VỞ
    if (position >= 148.5 && position <= 201.5) {
      rewardText = "CHÚC MỪNG BẠN TRÚNG ĐƯỢC CUỐN VỞ CDVD";
      code = generateRewardCode(6);
      descriptionText = "Vui lòng đến gian hàng Cao đẳng Viễn Đông để nhận quà hoặc gửi mã này cho fanpage.";
    }

    // ÁO
    else if (position >= 202.5 && position <= 246.5) {
      rewardText = "CHÚC MỪNG BẠN TRÚNG MỘT CON GẤU BÔNG";
      code = generateRewardCode(6);
      descriptionText = "Vui lòng đến gian hàng Cao đẳng Viễn Đông để nhận quà hoặc gửi mã này cho fanpage.";
    }

    // MÓC KHÓA
    else if (position >= 292.5 && position <= 336.5) {
      rewardText = "CHÚC MỪNG BẠN TRÚNG ĐƯỢC MÓC KHÓA CDVD";
      code = generateRewardCode(6);
      descriptionText = "Vui lòng đến gian hàng Cao đẳng Viễn Đông để nhận quà hoặc gửi mã này cho fanpage.";
    }

    // VÉ MAY MẮN
    else {
      rewardText = "CHÚC MỪNG BẠN TRÚNG ĐƯỢC MỘT CHIẾC VÉ MAY MẮN LẦN SAU";
      code = "";
      descriptionText = ""; // ❗ Không có mô tả
    }

    // Hiện nội dung chính
    $('.congratulation__note').text(rewardText);

    // Nếu có mã quà
    if (code) {
      $('.congratulation__code').html(
        `Mã nhận thưởng: <span style="color:red;font-style:italic">${code}</span>`
      );

      $('.congratulation__description').text(descriptionText);

      if (formPayload) {
        formPayload.reward = rewardText;
        formPayload.code = code;
      }
    } else {
      // ❗ Clear sạch nếu không có quà
      $('.congratulation__code').html('');
      $('.congratulation__description').text('');
    }

    winAudio.play();
    $('.popup').removeClass('active');
    $('.congratulation').fadeIn();

    $(".information-form button[type='submit']")
      .find(".loader")
      .fadeOut();

    /* MỞ LẠI LƯỢT CHƠI */
    setTimeout(() => {

      clicked = false;

      $(".information-form button[type='submit']")
        .prop("disabled", false);

      $(".information-form")[0].reset();

      isFilled = false;

    }, 1000);
  }

  function generateRewardCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }


  function submitToGoogleSheetAsync(payload, retry = 0) {
    return fetch("https://script.google.com/macros/s/AKfycbxlQQaMbpDuRp86o347gd_SA8BfN6NwL6mi_Q6HKIQybr7F2bEsOYs3zHCh_EtJIJAqrg/exec", {
      method: "POST",
      body: new URLSearchParams(payload),
    })
      .then(res => res.text())
      .then(() => {
        console.log("✅ Saved to Google Sheet");
        return true;
      })
      .catch(err => {
        console.warn("❌ Save failed", err);

        if (retry < 2) {
          return new Promise(resolve =>
            setTimeout(() =>
              resolve(submitToGoogleSheetAsync(payload, retry + 1)),
              1000
            )
          );
        }

        throw err;
      });
  }

  $(document).on(
    "click",
    ".information-form button[type='submit']",
    async function (event) {
      event.preventDefault();

      if (clicked) return;

      /* =========================
         GET INPUT
      ========================= */
      const inputNameValue = $('div[data-name="fullname"]').find("input").val();
      const inputPhoneValue = $('div[data-name="phone"]').find("input").val();
      const inputBirthdayValue = $('div[data-name="birthday"]').find("input").val();
      const inputClassValue = $('div[data-name="class"]').find("input").val();
      const inputHighschoolValue = $('div[data-name="highschool"]').find("input").val();
      const selectedIndustry = $('select[name="Training_industry"]').val();

      /* =========================
         VALIDATE
      ========================= */
      if (
        !inputNameValue ||
        !inputPhoneValue ||
        !inputBirthdayValue ||
        !inputHighschoolValue ||
        !inputClassValue
      ) {
        showNotify("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      if (inputNameValue.length < 3) {
        showNotify("Vui lòng nhập đầy đủ họ tên của bạn");
        return;
      }

      if (inputPhoneValue.length < 10 || inputPhoneValue.length > 11) {
        showNotify("Số điện thoại không hợp lệ!");
        return;
      }

      /* =========================
         LOCK BUTTON
      ========================= */
      clicked = true;

      const $btn = $(".information-form button[type='submit']");

      $btn.prop("disabled", true);
      $btn.find(".loader").fadeIn();

      /* =========================
         PREPARE DATA
      ========================= */
      formPayload = {
        fullname: inputNameValue,
        phone: inputPhoneValue,
        birthday: inputBirthdayValue,
        class: inputClassValue,
        highschool: inputHighschoolValue,
        industry: selectedIndustry,
        created_at: new Date().toISOString(),
        lane: lane
      };

      try {
        /* =========================
           SAVE GOOGLE SHEET
        ========================= */
        submitToGoogleSheetAsync(formPayload);

        isFilled = true;

        $(".information").fadeOut();

        setTimeout(() => {
          $btn.find(".loader").fadeOut();
        }, 300);

        /* =========================
           SPIN
        ========================= */
        spinWheel();

      } catch (err) {
        console.error(err);
        showNotify("Có lỗi xảy ra, thử lại!");
        clicked = false;
        $btn.prop("disabled", false);
        $btn.find(".loader").fadeOut();
      }
    }
  );

  /* =========================
     WHEEL BUTTON
  ========================= */
  $(".wheel__button").click(function () {

    if (clicked) {
      alert("Bạn đã chơi rồi!");
      return;
    }

    if (!isFilled) {
      $(".information").fadeIn();
      return;
    }

  });

  $(".congratulation__close").click(function () {
    $(".congratulation").fadeOut();
    $(".wheel__inner").css({
      transition: "none",
      transform: "rotate(0deg)",
    });
  });
  $(".congratulation").click(function (event) {
    if (event.target != this) return;
    $(this).fadeOut();
    $(".wheel__inner").css({
      transition: "none",
      transform: "rotate(0deg)",
    });
  });
  $(".information__close").click(function () {
    $(".information").fadeOut();
  });
  $(".information").click(function (event) {
    if (event.target != this) return;
    $(this).fadeOut();
  });

  $("#birthday")
    .focus(function () {
      $(this).attr("type", "date");
    })
    .blur(function () {
      let dateValue = $(this).val();
      if (dateValue) {
        let date = new Date(dateValue);
        let formattedDate =
          ("0" + date.getDate()).slice(-2) +
          "-" +
          ("0" + (date.getMonth() + 1)).slice(-2) +
          "-" +
          date.getFullYear();
        $(this).attr("type", "text").val(formattedDate);
      } else {
        $(this).attr("type", "text");
      }
    });

  window.testSpinReward = function (rewardName) {

    function rotate(angle) {
      let baseRotation = 5 * 360; // quay 5 vòng cho đẹp
      let final = baseRotation + angle;

      $(".wheel__inner").css({
        transition: "cubic-bezier(0.19,1,0.22,1) 3s",
        transform: `rotate(${final}deg)`
      });

      setTimeout(() => {
        getPosition(angle);
      }, 3000);
    }

    if (rewardName === "notebook") {

      decreaseStock("notebook", "notebookStock", (success) => {
        if (success) {
          let angle = 148.5 + 5; // nằm chắc trong vùng notebook
          rotate(angle);
        } else {
          alert("Notebook hết rồi");
        }
      });

    }
    else if (rewardName === "tshirt") {

      decreaseStock("tshirt", "tshirtStock", (success) => {
        if (success) {
          let angle = 202.5 + 5;
          rotate(angle);
        } else {
          alert("Tshirt hết rồi");
        }
      });

    }
    else if (rewardName === "keychain") {

      decreaseStock("keychain", "keychainStock", (success) => {
        if (success) {
          let angle = 292.5 + 5;
          rotate(angle);
        } else {
          alert("Keychain hết rồi");
        }
      });

    }
    else {
      // test may mắn
      let angle = 10;
      rotate(angle);
    }
  }

});


