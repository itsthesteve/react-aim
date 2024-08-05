const logger = {
  info: (...args: string[]) => {
    console.log(`%c ${args}`, "background: lightgreen; color:black");
  },
  warn: (...args: string[]) => {
    console.log(`%c ${args}`, "background: maroon; color:white");
  },
};

export default logger;
