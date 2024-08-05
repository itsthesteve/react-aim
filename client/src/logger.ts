const logger = {
  info: (...args) => {
    console.log(`%c ${args}`, "background: lightgreen; color:black");
  },
  warn: (...args) => {
    console.log(`%c ${args}`, "background: maroon; color:white");
  },
};

export default logger;
