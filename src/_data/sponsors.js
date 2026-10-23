// Sponsors are listed per edition, in the `sponsors` field of each
// ediciones/<edition>/competencia.md (see ediciones/README.md). Until PUBLIC is true,
// they only show on the dev server (npm start); staging and production hide them.

const PUBLIC = false;

export default function () {
  return { public: PUBLIC };
}
