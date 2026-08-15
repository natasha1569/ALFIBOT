const SectionHeader = ({ kicker, title, copy, actions = null }) => (
  <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
    <div>
      {kicker && <p className="section-kicker mb-1">{kicker}</p>}
      <h2 className="h5 fw-bold mb-1">{title}</h2>
      {copy && <p className="text-secondary mb-0">{copy}</p>}
    </div>
    {actions}
  </div>
);

export default SectionHeader;
