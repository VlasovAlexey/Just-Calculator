let Input = "",
  display = document.getElementById("display"),
  preview = document.getElementById("preview"),
  isDarkTheme = true;

// Restore saved theme
(function() {
  var saved = localStorage.getItem("theme");
  if (saved === "light") {
    isDarkTheme = false;
    document.body.classList.add("light-theme");
    var sunIcon = document.getElementById("sun-icon");
    var moonIcon = document.getElementById("moon-icon");
    if (sunIcon) sunIcon.style.display = "none";
    if (moonIcon) moonIcon.style.display = "";
    var metaTheme = document.getElementById("meta-theme-color");
    if (metaTheme) metaTheme.setAttribute("content", "#f5f5f5");
    if (typeof Android !== "undefined" && Android.onThemeChanged) {
      Android.onThemeChanged(false);
    }
  }
})();

fitDisplay();

// Haptic feedback on all button clicks
document.addEventListener("click", function(e) {
  if (e.target.closest("button") || e.target.closest(".theme-toggle") || e.target.closest(".github-link")) {
    if (typeof Android !== "undefined" && Android.haptic) {
      Android.haptic();
    } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
      window.webkit.messageHandlers.haptic.postMessage("");
    }
  }
});

window.addEventListener("resize", function() {
  fitDisplay();
  fitPreview();
  // Force WebView to recalculate layout on orientation change
  document.body.style.display = "none";
  document.body.offsetHeight; // trigger reflow
  document.body.style.display = "";
});

function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  var sunIcon = document.getElementById("sun-icon");
  var moonIcon = document.getElementById("moon-icon");
  if (isDarkTheme) {
    document.body.classList.remove("light-theme");
    sunIcon.style.display = "";
    moonIcon.style.display = "none";
  } else {
    document.body.classList.add("light-theme");
    sunIcon.style.display = "none";
    moonIcon.style.display = "";
  }
  // Update display text color for theme
  var currentColor = isDarkTheme ? "white" : "#1c1c1c";
  if (display.style.color !== "transparent") {
    display.style.color = currentColor;
  }
  // Update meta theme-color for PWA / mobile browsers
  var metaTheme = document.getElementById("meta-theme-color");
  if (metaTheme) {
    metaTheme.setAttribute("content", isDarkTheme ? "#000000" : "#f5f5f5");
  }
  // Notify Android app about theme change
  if (typeof Android !== "undefined" && Android.onThemeChanged) {
    Android.onThemeChanged(isDarkTheme);
  }
}

function formatNumber(str) {
  var parts = str.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function formatOperators(str) {
  return str.replace(/\*/g, "\u00D7").replace(/-/g, "\u2212").replace(/\//g, "\u00F7");
}

function fitPreview() {
  var baseSize = window.innerWidth <= 480 ? 40 : 30;
  var maxSize = baseSize;
  preview.style.fontSize = baseSize + "px";
  var containerWidth = preview.parentElement.clientWidth - 10;
  if (containerWidth <= 0) return;
  while (preview.scrollWidth > containerWidth && baseSize > 14) {
    baseSize -= 1;
    preview.style.fontSize = baseSize + "px";
  }
}

function updateDisplay() {
  var raw = display.getAttribute("data-raw") || "";
  var formatted = raw.replace(/\d[\d.]*/g, function(match) {
    return formatNumber(match);
  });
  display.value = formatOperators(formatted);
  fitDisplay();
}

function updatePreview() {
  try {
    var result = eval(Input);
    if (result !== undefined && Input !== "" && Input !== result.toString()) {
      if (Math.abs(result) < 1e-14) result = 0;
      if (typeof result === "number" && !Number.isInteger(result)) {
        result = parseFloat(result.toFixed(7));
      }
      preview.textContent = "= " + formatNumber(result.toString());
      fitPreview();
    } else {
      preview.textContent = "";
    }
  } catch (e) {
    preview.textContent = "";
  }
}

function getDisplayColor() {
  return isDarkTheme ? "white" : "#1c1c1c";
}

function clearDisplay() {
  display.style.color = "transparent";
  setTimeout(function() {
    Input = "";
    display.setAttribute("data-raw", "");
    display.value = "";
    preview.textContent = "";
    fitDisplay();
    display.style.color = getDisplayColor();
  }, 100);
}

function displayResult(value) {
  if (Math.abs(value) < 1e-14) value = 0;
  if (typeof value === "number" && !Number.isInteger(value)) {
    value = parseFloat(value.toFixed(7));
  }
  display.style.color = "transparent";
  setTimeout(function() {
    var str = value.toString();
    display.setAttribute("data-raw", str);
    display.value = formatOperators(formatNumber(str));
    Input = str;
    fitDisplay();
    display.style.color = getDisplayColor();
  }, 100);
}

function fitDisplay() {
  var baseSize = window.innerWidth <= 480 ? 70 : 50;
  display.style.fontSize = baseSize + "px";
  while (display.scrollWidth > display.clientWidth && baseSize > 10) {
    baseSize -= 2;
    display.style.fontSize = baseSize + "px";
  }
}

function deleteLast() {
  display.style.color = "transparent";
  setTimeout(function() {
    var raw = display.getAttribute("data-raw") || "";
    raw = raw.slice(0, -1);
    display.setAttribute("data-raw", raw);
    Input = Input.slice(0, -1);
    var formatted = raw.replace(/\d[\d.]*/g, function(match) {
      return formatNumber(match);
    });
    display.value = formatOperators(formatted);
    fitDisplay();
    display.style.color = getDisplayColor();
    updatePreview();
  }, 100);
}

function calculateResult() {
  try {
    displayResult(eval(Input));
    preview.textContent = "";
    setTimeout(function() {
      copyToClipboard((display.getAttribute("data-raw") || "").replace(/,/g, ""));
    }, 150);
  } catch (error) {
    display.value = "ERROR";
    preview.textContent = "";
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(function() {});
  }
}

function isOperator(ch) {
  return "+-*/%^".indexOf(ch) !== -1;
}

function validateInput(raw, value) {
  var lastChar = raw.slice(-1);

  // Одиночный оператор
  if (value.length === 1 && isOperator(value)) {
    if (isOperator(lastChar)) return false;
    if (raw === "") return false;
  }

  // Блокируем повторные функции подряд: sin(sin(, cos(cos( и т.д.
  var funcs = ["sin", "cos", "tan", "sih", "coh", "tah", "ln", "log10", "sqrt", "cbrt", "abs"];
  if (funcs.indexOf(value) !== -1) {
    for (var i = 0; i < funcs.length; i++) {
      if (raw.endsWith(funcs[i] + "(")) return false;
    }
  }

  // Блокируем повторную точку в одном числе
  if (value === ".") {
    var currentNum = raw.match(/[\d.]*$/);
    if (currentNum && currentNum[0].indexOf(".") !== -1) return false;
  }

  // Блокируем % после оператора или в начале
  if (value === "%") {
    if (raw === "" || isOperator(lastChar) || lastChar === "(") return false;
  }

  return true;
}

function appendToDisplay(value) {
  value = value.replace(new RegExp("o_b", "g"), "(");
  value = value.replace(new RegExp("c_b", "g"), ")");

  // Валидация перед обработкой
  var raw = display.getAttribute("data-raw") || "";
  if (!validateInput(raw, value)) return;

  calculate(value);
  value = value.replace(new RegExp("sin", "g"), "sin(");
  value = value.replace(new RegExp("cos", "g"), "cos(");
  value = value.replace(new RegExp("tan", "g"), "tan(");
  value = value.replace(new RegExp("sih", "g"), "sinh(");
  value = value.replace(new RegExp("coh", "g"), "cosh(");
  value = value.replace(new RegExp("tah", "g"), "tanh(");
  value = value.replace(new RegExp("ln", "g"), "ln(");
  value = value.replace(new RegExp("log10", "g"), "log10(");
  value = value.replace(new RegExp("sqrt", "g"), "sqrt(");
  value = value.replace(new RegExp("cbrt", "g"), "cbrt(");
  value = value.replace(new RegExp("abs", "g"), "abs(");

  raw = raw + value;
  display.setAttribute("data-raw", raw);
  var formatted = raw.replace(/\d[\d.]*/g, function(match) {
    return formatNumber(match);
  });
  display.value = formatOperators(formatted);
  fitDisplay();
  updatePreview();
}

function calculate(value) {
  value = value.replace(/\^/g, "**");
  value = value.replace(new RegExp("e", "g"), "Math.E");
  value = value.replace(new RegExp("π", "g"), "Math.PI");
  value = value.replace(new RegExp("sin", "g"), "Math.sin(Math.PI / 180 * ");
  value = value.replace(new RegExp("cos", "g"), "Math.cos(Math.PI / 180 * ");
  value = value.replace(new RegExp("tan", "g"), "Math.tan(Math.PI / 180 * ");
  value = value.replace(new RegExp("sih", "g"), "Math.sin(Math.PI / 180 * ");
  value = value.replace(new RegExp("coh", "g"), "Math.cos(Math.PI / 180 * ");
  value = value.replace(new RegExp("tah", "g"), "Math.tan(Math.PI / 180 * ");
  value = value.replace(new RegExp("ln", "g"), "Math.log( ");
  value = value.replace(new RegExp("log10", "g"), "Math.log10( ");
  value = value.replace(new RegExp("sqrt", "g"), "Math.sqrt( ");
  value = value.replace(new RegExp("cbrt", "g"), "Math.cbrt( ");
  value = value.replace(new RegExp("abs", "g"), "Math.abs(");

  Input += value;
}
function Factorial() {
  Input = factorial(Input);
  display.value = Input;
}

function factorial(n) {
  return n == 0 || n == 1 ? 1 : n * factorial(n - 1);
}

function Rand() {
  Input = parseInt(Math.random() * 1000);
  display.value = Input;
}
