let clients = [];

const subscribe = (res) => {
  clients.push(res);
};

const publish = (message) => {
  clients.forEach((resolve) => {
    resolve(message);
  });

  clients = [];
};

module.exports = {subscribe, publish};
