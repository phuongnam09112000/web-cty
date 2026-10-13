const routes = [
  {
    path: ["/", "/home"],
    exact: true,
    component: "Home",
  },
  {
    path: ["/about"],
    exact: true,
    component: "About",
  },
  {
    path: ["/integration"],
    exact: true,
    component: "Integration",
  },
  {
    path: ["/contact"],
    exact: true,
    component: "Contact",
  },
  {
    path: ["/software"],
    exact: true,
    component: "Software",
  },
  {
    path: ["/support"],
    exact: true,
    component: "Support",
  },
  {
    path: ["/support"],
    exact: true,
    component: "Support",
  },
  {
    path: ["/information-communication-technology"],
    exact: true,
    component: "Ict",
  },
  {
    path: ["/secure-defense"],
    exact: true,
    component: "Secure",
  },
  {
    path: ["/digital-transformation"],
    exact: true,
    component: "Digital",
  },
  {
    path: ["/services"],
    exact: true,
    component: "Services",
  },
  // Must stay last: shown for any URL that no route above matches
  {
    path: ["*"],
    exact: false,
    component: "NotFound",
  },
];

export default routes;
