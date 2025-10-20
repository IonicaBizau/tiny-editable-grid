"use strict";

const tinyEditableGrid = require("../lib");

tinyEditableGrid("#my-div", {
  headers: [
    { label: "Currency", enum: ["USD", "GBP"] },
    { label: "Price", type: "number" },
    { label: "Country", enum: ["EU", "USA", "GOAT"] }
  ],
  data: [["USD", 123, "USA"]],
  onChange(data) { console.log("Updated:", data); }
});