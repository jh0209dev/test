(function () {
  const STORAGE_KEY = "gym-inquiries-v1";
  const UPDATE_EVENT = "gym-inquiries-updated";

  function readAll() {
    let raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      throw new Error("이 브라우저의 저장 공간을 사용할 수 없습니다.");
    }
    if (raw === null) return [];
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error("저장된 문의 데이터를 읽을 수 없습니다. 원본 데이터는 그대로 보존했습니다.");
    }
    if (!Array.isArray(parsed)) {
      throw new Error("저장된 문의 데이터 형식이 올바르지 않습니다. 원본 데이터는 그대로 보존했습니다.");
    }
    return parsed;
  }

  function writeAll(items) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      throw new Error("문의 저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.");
    }
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: items }));
  }

  window.GymInquiries = Object.freeze({
    key: STORAGE_KEY,
    eventName: UPDATE_EVENT,
    readAll,
    writeAll
  });
})();
