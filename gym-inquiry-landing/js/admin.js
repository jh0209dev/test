(function () {
  const PASSCODE = "1234";
  const accessPanel = document.getElementById("access-panel");
  const accessForm = document.getElementById("access-form");
  const accessInput = document.getElementById("admin-code");
  const accessError = document.getElementById("access-error");
  const workspace = document.getElementById("admin-workspace");
  const inquiryList = document.getElementById("inquiry-list");
  const count = document.getElementById("inquiry-count");
  const storageError = document.getElementById("storage-error");
  let unlocked = false;

  const statuses = [
    { value: "new", label: "신규" },
    { value: "contacted", label: "연락완료" },
    { value: "registered", label: "등록" },
    { value: "closed", label: "종료" }
  ];

  accessForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (accessInput.value === PASSCODE) {
      unlocked = true;
      accessError.textContent = "";
      accessPanel.hidden = true;
      workspace.hidden = false;
      accessInput.value = "";
      render();
    } else {
      accessError.textContent = "비밀번호를 다시 확인해 주세요.";
      accessInput.value = "";
      accessInput.focus();
    }
  });

  function make(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "접수 시각 확인 필요";
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
    }).format(date);
  }

  function showStorageError(message) {
    storageError.textContent = message;
    storageError.hidden = false;
    inquiryList.replaceChildren();
    count.textContent = "—";
  }

  function createEmptyState() {
    const empty = make("div", "admin-empty");
    empty.append(make("div", "empty-mark", "＋"));
    empty.append(make("h3", "", "아직 문의가 없어요"));
    empty.append(make("p", "", "소개 페이지에서 테스트 문의를 작성하면\n이 목록에 표시됩니다."));
    return empty;
  }

  function createStatusControl(inquiry) {
    const wrap = make("div", "status-control");
    const label = make("label", "", "문의 상태");
    const select = document.createElement("select");
    select.setAttribute("aria-label", inquiry.name + " 문의 상태");
    statuses.forEach(function (status) {
      const option = document.createElement("option");
      option.value = status.value;
      option.textContent = status.label;
      option.selected = (inquiry.status || "new") === status.value;
      select.append(option);
    });
    select.addEventListener("change", function () {
      updateInquiry(inquiry.id, { status: select.value });
      render();
    });
    wrap.append(label, select);
    return wrap;
  }

  function createMemoControl(inquiry) {
    const wrap = make("div", "memo-control");
    const label = make("label", "", "관리자 메모");
    const textarea = document.createElement("textarea");
    textarea.value = inquiry.memo || "";
    textarea.placeholder = "연락 예정일이나 상담 내용을 적어두세요";
    textarea.setAttribute("aria-label", inquiry.name + " 문의 메모");
    const button = make("button", "save-memo", "메모 저장");
    button.type = "button";
    const feedback = make("p", "memo-feedback", "");
    button.addEventListener("click", function () {
      try {
        updateInquiry(inquiry.id, { memo: textarea.value.trim() });
        feedback.textContent = "저장했어요.";
        window.setTimeout(function () { feedback.textContent = ""; }, 1800);
      } catch (error) {
        feedback.textContent = error.message;
      }
    });
    wrap.append(label, textarea, button, feedback);
    return wrap;
  }

  function createCard(inquiry) {
    const card = make("article", "inquiry-card");
    const main = make("div", "inquiry-main");
    const head = make("div", "inquiry-card-head");
    const identity = make("div", "");
    identity.append(make("h3", "inquiry-name", inquiry.name || "이름 없음"));
    identity.append(make("div", "inquiry-contact", inquiry.phone || "연락처 없음"));
    head.append(identity, make("time", "inquiry-date", formatDate(inquiry.createdAt)));
    main.append(head);
    if (inquiry.interest) {
      const tags = make("div", "inquiry-meta");
      tags.append(make("span", "inquiry-tag", inquiry.interest));
      main.append(tags);
    }
    main.append(make("p", inquiry.message ? "inquiry-message" : "inquiry-message empty-message", inquiry.message || "추가 문의 내용이 없습니다."));
    const controls = make("div", "admin-controls");
    controls.append(createStatusControl(inquiry), createMemoControl(inquiry));
    card.append(main, controls);
    return card;
  }

  function render() {
    if (!unlocked) return;
    storageError.hidden = true;
    storageError.textContent = "";
    let inquiries;
    try {
      inquiries = window.GymInquiries.readAll();
    } catch (error) {
      showStorageError(error.message);
      return;
    }
    inquiries = inquiries.slice().sort(function (a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    count.textContent = String(inquiries.length);
    inquiryList.replaceChildren();
    if (inquiries.length === 0) {
      inquiryList.append(createEmptyState());
      return;
    }
    inquiries.forEach(function (inquiry) {
      inquiryList.append(createCard(inquiry));
    });
  }

  function updateInquiry(id, changes) {
    const inquiries = window.GymInquiries.readAll();
    const index = inquiries.findIndex(function (inquiry) { return inquiry.id === id; });
    if (index === -1) throw new Error("문의를 찾을 수 없습니다. 목록을 새로고침해 주세요.");
    inquiries[index] = Object.assign({}, inquiries[index], changes);
    window.GymInquiries.writeAll(inquiries);
  }

  window.addEventListener("storage", function (event) {
    if (event.key === window.GymInquiries.key && unlocked) render();
  });
})();
