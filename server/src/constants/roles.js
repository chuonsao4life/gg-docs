export const ROLES = {
  VIEWER: "viewer",
  COMMENTER: "commenter",
  EDITOR: "editor",
  OWNER: "owner",
};

export const ROLE_WEIGHTS = {
  [ROLES.VIEWER]: 1,
  [ROLES.COMMENTER]: 2,
  [ROLES.EDITOR]: 3,
  [ROLES.OWNER]: 4,
};
