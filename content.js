function createMemo(content = "", x = 100, y = 100, width = 200, height = 150) {
  const memoWrapper = document.createElement("div");
  memoWrapper.className = "memo-wrapper";
  memoWrapper.style.left = x + "px";
  memoWrapper.style.top = y + "px";
  memoWrapper.style.width = width + "px";
  memoWrapper.style.height = height + "px";

  const memo = document.createElement("textarea");
  memo.className = "memo";
  memo.value = content;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "memo-delete";
  deleteBtn.innerText = "X";
  deleteBtn.title = "Supprimer ce mémo";
  deleteBtn.addEventListener("click", () => {
    memoWrapper.remove();
    saveMemos();
  });

  const resizeHandle = document.createElement("div");
  resizeHandle.className = "memo-resize";

  memo.addEventListener("input", saveMemos);
  memo.addEventListener("blur", saveMemos);

  chrome.storage.sync.get("memoBgColor", (data) => {
    const color = data.memoBgColor || "#fff8b0";
    memoWrapper.style.background = color;
  });

  memoWrapper.appendChild(deleteBtn);
  memoWrapper.appendChild(memo);
  memoWrapper.appendChild(resizeHandle);
  document.body.appendChild(memoWrapper);

  makeDraggable(memoWrapper, memo);
  makeResizable(memoWrapper, resizeHandle);
}

function saveMemos() {
  const wrappers = Array.from(document.querySelectorAll(".memo-wrapper"));
  const memos = wrappers.map((wrapper) => {
    const memo = wrapper.querySelector("textarea");
    return {
      content: memo.value,
      x: wrapper.offsetLeft,
      y: wrapper.offsetTop,
      width: memo.offsetWidth,
      height: memo.offsetHeight,
    };
  });
  chrome.storage.local.set({ [location.href]: memos });
}

function restoreMemos() {
  chrome.storage.local.get([location.href], (result) => {
    const memos = result[location.href] || [];
    memos.forEach((m) => createMemo(m.content, m.x, m.y, m.width, m.height));
  });
}

function makeDraggable(wrapper, textarea) {
  let offsetX, offsetY;
  wrapper.addEventListener("mousedown", (e) => {
    // Ignore drag from the resize handle or delete button
    if (
      e.target.classList.contains("memo-resize") ||
      e.target.classList.contains("memo-delete")
    )
      return;

    offsetX = e.clientX - wrapper.offsetLeft;
    offsetY = e.clientY - wrapper.offsetTop;

    function move(e) {
      wrapper.style.left = e.clientX - offsetX + "px";
      wrapper.style.top = e.clientY - offsetY + "px";
    }

    document.addEventListener("mousemove", move);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", move);
        saveMemos();
      },
      { once: true }
    );
  });
}

function makeResizable(wrapper, handle) {
  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = wrapper.offsetWidth;
    const startHeight = wrapper.offsetHeight;

    function resize(e) {
      wrapper.style.width = startWidth + (e.clientX - startX) + "px";
      wrapper.style.height = startHeight + (e.clientY - startY) + "px";
    }

    document.addEventListener("mousemove", resize);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", resize);
        saveMemos();
      },
      { once: true }
    );
  });
}

// Restore on load
restoreMemos();

// Listen to background trigger
window.addEventListener("add-memo", () => createMemo());
