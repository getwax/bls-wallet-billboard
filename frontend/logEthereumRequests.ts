window.addEventListener("load", () => {
  const ethereum = (window as any).ethereum;
  const oldRequest = ethereum.request.bind(ethereum);
  let nextId = 0;

  ethereum.request = async (...args: any[]) => {
    const id = nextId++;

    console.log(
      `ethereum.request(${args
        .map((a) => JSON.stringify(a, null, 2))
        .join(", ")})`,
      id
    );

    try {
      const result = await oldRequest(...args);
      console.log("ethereum.request", id, { result });
      return result;
    } catch (error) {
      console.log("ethereum.request", id, { error });
      throw error;
    }
  };
});
