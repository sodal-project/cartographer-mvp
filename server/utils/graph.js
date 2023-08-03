const Graph = {
  Node: {
    Persona: "Persona",
  },
  Relationship: {
    HasAlias: "HAS_ALIAS",
    AliasOf: "ALIAS_OF",
    Indirect: "INDIRECT_CONTROL",
    Read: "READ_CONTROL",
    Guest: "GUEST_CONTROL",
    User: "USER_CONTROL",
    Admin: "ADMIN_CONTROL",
    SuperAdmin: "SUPERADMIN_CONTROL",
    System: "SYSTEM_CONTROL",
  }
}

module.exports = { Graph };