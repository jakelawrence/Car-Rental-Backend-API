test("string with a single number should result in the number itself", () => {
  fetch("http://example.com/movies.json")
    .then((response) => response.json())
    .then((data) => console.log(data));
});
