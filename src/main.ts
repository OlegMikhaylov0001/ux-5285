const users = [
  {
    id: 1,
    name: "User 1",
    avatar: "/user-1.webp",
  },
  {
    id: 2,
    name: "User 2",
    avatar: "/user-2.webp",
  },
  {
    id: 3,
    name: "User 3",
    avatar: "/user-3.webp",
  },
  {
    id: 4,
    name: "User 4",
    avatar: "/user-4.webp",
  },
  {
    id: 5,
    name: "User 5",
    avatar: "/user-5.webp",
  },
  {
    id: 6,
    name: "User 6",
    avatar: "/user-6.webp",
  },
];

function renderUserList(users) {
  const userListHTML = users
    .map((user) => `<li class="item"><img alt="${user.name}" src="${user.avatar}"/></li>`)
    .join("");

  return `<ul class="imgList">${userListHTML}</ul>`;
}

// Использование
const userListElement = document.querySelector(".imgList").parentNode;
userListElement.innerHTML = renderUserList(users);
