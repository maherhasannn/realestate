const features = [
  {
    tag: 'Predictive engine',
    title: 'Know who\u2019s selling before they list',
    desc: 'Signal ingests 47 data streams \u2014 public records, permit activity, mortgage events, behavioral signals \u2014 and scores every homeowner on likelihood to sell in the next 90 days.',
    stat: '94% accuracy on 90-day predictions',
  },
  {
    tag: 'Automated outreach',
    title: 'Launch campaigns without lifting a finger',
    desc: 'Once Signal identifies a high-probability seller, it triggers multi-channel sequences: personalized SMS, email, direct mail, and retargeting ads \u2014 all compliant, all trackable.',
    stat: '428 active campaigns right now',
  },
  {
    tag: 'Authority content',
    title: 'Hyperlocal content that builds trust',
    desc: 'Signal generates market reports, neighborhood analyses, and seller guides tailored to each micro-market. Your agents become the local expert without writing a word.',
    stat: 'Generated for 340+ zip codes',
  },
  {
    tag: 'Brokerage view',
    title: 'A live pipeline across your entire org',
    desc: 'Leadership sees every opportunity, every campaign, every conversion in real time. Filter by agent, region, price point, or probability score. No more spreadsheets.',
    stat: '$486M projected pipeline volume',
  },
];

export default function Features() {
  return (
    <section className="features-section">
      <div className="features-inner">
        {features.map((f, i) => (
          <div className="feature" key={i}>
            <div className="feature-tag">{f.tag}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <div className="feature-stat">
              <div className="feature-stat-dot"></div>
              {f.stat}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
