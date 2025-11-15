import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Category mapping
const CATEGORIES = [
  "Love & Romance",
  "Racism", 
  "Sexism",
  "Homo/Transphobia",
  "Threat of A.I."
] as const;

const TYPES = ["ACTION", "SHARE", "KNOW", "ALTERNATIVE"] as const;

// Song data
const SONGS = [
  { title: "Some Justice Opportunity (Featuring Just B. & Gleeko) (AI Reimagine)", theme: "racism" },
  { title: "Moonlight Summer Dance (AI Reimagined)", theme: "love" },
  { title: "Stand Up (AI Reimagined)", theme: "politics" },
  { title: "Is This Our America (AI Reimagined)", theme: "politics" },
  { title: "Mineola (Screaming Your Name In The Night)", theme: "love" },
  { title: "Please You (AI Reimagined)", theme: "love" },
  { title: "The Dream (AI Reimagined)", theme: "dreams" },
  { title: "Come On, Come On (AI Reimagined)*", theme: "love" },
  { title: "She's Taking Me With Her (AI Reimagined)*", theme: "love" },
  { title: "The Love (AI Reimagined)*", theme: "love" },
  { title: "Take The Dream (AI Reimagined)*", theme: "dreams" }
];

// KNOW challenges - Questions from uploaded files
const KNOW_CHALLENGES = {
  "Racism": [
    { q: "What was the main cause of slavery in the United States?", a: "A belief in the inferiority of African people and the need for cheap labor", points: 30 },
    { q: "What was the main goal of the Reconstruction era (1865-1877)?", a: "To give African Americans equal rights and opportunities", points: 40 },
    { q: "What was the purpose of the Jim Crow laws?", a: "To encourage racial segregation", points: 25 },
    { q: "How did the Supreme Court's 1954 decision in Brown v. Board of Education impact segregation?", a: "It struck down segregation in public schools as unconstitutional", points: 50 },
    { q: "What was the main goal of the Civil Rights Act of 1964?", a: "To end discrimination based on race, color, religion, sex, or national origin", points: 40 },
    { q: "Who was the first African American to be elected President of the United States?", a: "Barack Obama", points: 20 },
    { q: "What event is widely considered the beginning of the modern civil rights movement?", a: "The Montgomery Bus Boycott", points: 35 },
    { q: "Who was the first African American to be appointed to the Supreme Court?", a: "Thurgood Marshall", points: 45 },
    { q: "What was the 'one-drop rule'?", a: "A rule stating that any person with even a single African ancestor was considered African American", points: 30 },
    { q: "What were the three main demands of the Black Lives Matter movement?", a: "End police violence, systemic racism, and demand accountability", points: 35 },
    { q: "Who was the first African American to hold a Cabinet-level position in the US government?", a: "Robert C. Weaver (Secretary of Housing and Urban Development)", points: 50 },
    { q: "What was the name of the landmark Supreme Court case that declared segregation unconstitutional?", a: "Brown v. Board of Education", points: 30 },
    { q: "Who was the first African American to hold a seat in the United States Senate?", a: "Hiram Revels", points: 55 },
    { q: "What was the Civil Rights Act of 1964?", a: "Legislation that banned discrimination based on race, color, religion, sex, or national origin", points: 35 },
    { q: "Who was the first African American to be awarded a Nobel Prize?", a: "Ralph Bunche (Nobel Peace Prize, 1950)", points: 60 },
    { q: "Who was the first African American to hold a seat in the US House of Representatives?", a: "Joseph Rainey", points: 50 },
    { q: "What was the main reason for the Chinese Exclusion Act of 1882?", a: "To limit Chinese immigration and protect American workers", points: 40 },
    { q: "What was the main reason for the Indian Removal Act of 1830?", a: "To forcibly relocate Native Americans and seize their land", points: 45 },
    { q: "Which Supreme Court case established 'separate but equal' doctrine?", a: "Plessy v. Ferguson", points: 40 },
    { q: "What year was the Voting Rights Act passed?", a: "1965", points: 30 }
  ],
  "Sexism": [
    { q: "What was the first country to grant women the right to vote?", a: "New Zealand", points: 30 },
    { q: "Who was the first woman to be elected to the United States Congress?", a: "Jeannette Rankin", points: 40 },
    { q: "What was the main goal of the women's suffrage movement?", a: "To gain the right to vote", points: 25 },
    { q: "Which amendment to the US Constitution granted women the right to vote?", a: "19th Amendment", points: 30 },
    { q: "Who was the first woman to serve as CEO of a Fortune 500 company?", a: "Carly Fiorina (Hewlett-Packard)", points: 45 },
    { q: "Who was the first woman to be awarded the Nobel Peace Prize?", a: "Jane Addams (shared with Nicholas Murray Butler)", points: 50 },
    { q: "Who was the first female Supreme Court justice in the United States?", a: "Sandra Day O'Connor", points: 35 },
    { q: "Who was the first female Speaker of the United States House of Representatives?", a: "Nancy Pelosi", points: 30 },
    { q: "Who was the first woman to fly solo across the Atlantic Ocean?", a: "Amelia Earhart", points: 40 },
    { q: "Who was the first woman to be nominated for President by a major political party?", a: "Hillary Clinton (2016)", points: 25 },
    { q: "When was the 19th Amendment passed?", a: "1920", points: 30 },
    { q: "Who was the first woman to serve as US Secretary of State?", a: "Madeleine Albright", points: 40 },
    { q: "Who was the first woman to fly in space?", a: "Valentina Tereshkova (USSR) or Sally Ride (USA)", points: 35 },
    { q: "Who was the first woman to win a Pulitzer Prize for Fiction?", a: "Edith Wharton", points: 55 },
    { q: "Who was the first woman to be awarded the Nobel Prize in Literature?", a: "Selma Lagerlöf", points: 60 },
    { q: "Who was the first woman to be awarded the Nobel Prize in Physics?", a: "Marie Curie", points: 50 },
    { q: "What landmark Supreme Court case declared gender-based education segregation unconstitutional?", a: "United States v. Virginia", points: 45 },
    { q: "Who was the first female prime minister of a Muslim-majority country?", a: "Benazir Bhutto (Pakistan)", points: 50 },
    { q: "Which woman was a key figure in the women's suffrage movement and worked alongside Elizabeth Cady Stanton?", a: "Susan B. Anthony", points: 35 },
    { q: "Who was Shirley Chisholm?", a: "First African American woman elected to Congress and first to run for President", points: 40 }
  ],
  "Homo/Transphobia": [
    { q: "What year did the Stonewall riots occur, marking a turning point in LGBTQ+ rights?", a: "1969", points: 40 },
    { q: "What does the acronym LGBTQ+ stand for?", a: "Lesbian, Gay, Bisexual, Transgender, Queer/Questioning, and others", points: 20 },
    { q: "What landmark Supreme Court case legalized same-sex marriage nationwide in the US?", a: "Obergefell v. Hodges (2015)", points: 35 },
    { q: "Which president issued the 'Don't Ask, Don't Tell' policy, and who later repealed it?", a: "Bill Clinton issued it; Barack Obama repealed it", points: 45 },
    { q: "What is the Trevor Project?", a: "A crisis intervention and suicide prevention organization for LGBTQ+ youth", points: 30 },
    { q: "What was the first US state to legalize same-sex marriage?", a: "Massachusetts (2004)", points: 40 },
    { q: "What does 'coming out' mean in LGBTQ+ context?", a: "Publicly disclosing one's sexual orientation or gender identity", points: 25 },
    { q: "What is Gender Identity?", a: "One's internal sense of being male, female, both, or neither", points: 30 },
    { q: "What does the term 'cisgender' mean?", a: "When one's gender identity matches the sex assigned at birth", points: 30 },
    { q: "What does 'non-binary' mean?", a: "Gender identity that doesn't fit exclusively into male or female categories", points: 30 },
    { q: "When was the first Pride parade held?", a: "1970 (one year after Stonewall)", points: 35 },
    { q: "What is the significance of the rainbow flag?", a: "Symbol of LGBTQ+ pride and diversity created by Gilbert Baker", points: 25 },
    { q: "What does 'transgender' mean?", a: "When one's gender identity differs from the sex assigned at birth", points: 25 },
    { q: "What is 'conversion therapy'?", a: "Discredited practice attempting to change sexual orientation or gender identity", points: 40 },
    { q: "When was homosexuality removed from the DSM as a mental disorder?", a: "1973", points: 50 },
    { q: "What is the Equality Act?", a: "Proposed US legislation to prohibit discrimination based on sexual orientation and gender identity", points: 45 },
    { q: "Who was Harvey Milk?", a: "First openly gay elected official in California, assassinated in 1978", points: 50 },
    { q: "What does 'deadnaming' mean?", a: "Using a transgender person's birth name instead of their chosen name", points: 35 },
    { q: "What are preferred pronouns?", a: "The pronouns a person wishes to be referred to by (he/him, she/her, they/them, etc.)", points: 25 },
    { q: "What percentage of LGBTQ+ youth seriously consider suicide annually?", a: "Over 40% according to Trevor Project research", points: 55 }
  ],
  "Threat of A.I.": [
    { q: "What was the first social media platform to gain widespread popularity?", a: "MySpace", points: 25 },
    { q: "Which technology company developed the Android operating system?", a: "Google", points: 20 },
    { q: "Who co-founded PayPal and is now CEO of SpaceX and Tesla?", a: "Elon Musk", points: 30 },
    { q: "Which technology company is known for its iPod and iPhone products?", a: "Apple", points: 20 },
    { q: "What is the name of Google's parent company?", a: "Alphabet Inc.", points: 30 },
    { q: "Which technology company developed the Windows operating system?", a: "Microsoft", points: 20 },
    { q: "Who co-founded Microsoft and is known for philanthropic efforts?", a: "Bill Gates", points: 25 },
    { q: "What does AI stand for?", a: "Artificial Intelligence", points: 15 },
    { q: "What is machine learning?", a: "A type of AI that allows systems to learn from data without being explicitly programmed", points: 35 },
    { q: "What is deep learning?", a: "A subset of machine learning using neural networks with multiple layers", points: 40 },
    { q: "What is a neural network?", a: "Computing system inspired by biological neural networks in human brains", points: 35 },
    { q: "What is the Turing Test?", a: "A test of a machine's ability to exhibit intelligent behavior indistinguishable from a human", points: 45 },
    { q: "Who is considered the father of computer science and artificial intelligence?", a: "Alan Turing", points: 40 },
    { q: "What is facial recognition technology?", a: "AI that identifies or verifies people from digital images or video", points: 30 },
    { q: "What are deepfakes?", a: "AI-generated synthetic media that convincingly replace one person's likeness with another", points: 40 },
    { q: "What is algorithmic bias?", a: "Systematic errors in AI systems that create unfair outcomes for certain groups", points: 45 },
    { q: "What is automation?", a: "Technology that performs tasks without human intervention", points: 25 },
    { q: "What percentage of jobs are estimated to be at risk from automation by 2030?", a: "Approximately 30-50% depending on the study", points: 50 },
    { q: "What is data privacy?", a: "The right to control how personal information is collected and used", points: 30 },
    { q: "What is surveillance capitalism?", a: "Economic system centered on capturing personal data for profit", points: 50 }
  ],
  "Love & Romance": [
    { q: "What percentage of marriages in the US end in divorce?", a: "Approximately 40-50%", points: 30 },
    { q: "What is consent in relationships?", a: "Voluntary, enthusiastic agreement to engage in specific activities", points: 25 },
    { q: "What is emotional abuse?", a: "Pattern of behavior that harms someone's emotional well-being and self-worth", points: 35 },
    { q: "What is gaslighting?", a: "Psychological manipulation making someone question their reality or sanity", points: 40 },
    { q: "What is a healthy relationship?", a: "One built on mutual respect, trust, honesty, and equality", points: 25 },
    { q: "What are red flags in dating?", a: "Warning signs of potentially unhealthy or abusive behavior", points: 30 },
    { q: "What is love bombing?", a: "Overwhelming someone with affection/attention early in a relationship to manipulate them", points: 40 },
    { q: "What is the difference between love and infatuation?", a: "Love is deep and lasting; infatuation is intense but temporary attraction", points: 30 },
    { q: "What is active listening in relationships?", a: "Fully concentrating, understanding, and responding thoughtfully to a partner", points: 35 },
    { q: "What is a boundary in relationships?", a: "Limits you establish to protect your physical and emotional well-being", points: 30 },
    { q: "What is codependency?", a: "Excessive emotional or psychological reliance on a partner", points: 40 },
    { q: "What is the National Domestic Violence Hotline number?", a: "1-800-799-7233", points: 45 },
    { q: "What percentage of women experience domestic violence in their lifetime?", a: "1 in 4 women (25%)", points: 35 },
    { q: "What percentage of men experience domestic violence in their lifetime?", a: "1 in 9 men (approximately 11%)", points: 35 },
    { q: "What is affirmative consent?", a: "Clear, enthusiastic, ongoing agreement throughout a sexual encounter", points: 35 },
    { q: "What is sexual coercion?", a: "Pressuring or manipulating someone into sexual activity against their will", points: 40 },
    { q: "What is the honeymoon phase in abusive relationships?", a: "Period of calm and affection following abuse, creating a cycle", points: 45 },
    { q: "What is financial abuse?", a: "Controlling someone's financial resources to maintain power in a relationship", points: 40 },
    { q: "What is reproductive coercion?", a: "Controlling someone's reproductive choices without their consent", points: 45 },
    { q: "What organization provides reproductive health services and education?", a: "Planned Parenthood", points: 30 }
  ]
};

// ACTION challenges
const ACTION_TEMPLATES = {
  "Racism": [
    "Join a protest or demonstration against racial injustice in your community",
    "Volunteer at a local racial justice organization such as the NAACP or Black Lives Matter",
    "Donate to a racial justice charity or organization",
    "Attend a racial justice protest or rally",
    "Contact your local government representatives and advocate for racial justice legislation",
    "Join a racial justice book club or discussion group",
    "Participate in a racial justice fundraiser or fundraising campaign",
    "Educate yourself about racial justice by reading books, articles, or watching documentaries",
    "Support businesses owned by people of color",
    "Participate in a peaceful protest or rally for racial justice",
    "Attend a workshop or seminar on racial reconciliation or diversity",
    "Volunteer at an organization that serves disadvantaged communities of color",
    "Start a dialogue group or book club to discuss issues of race and privilege",
    "Write letters or make phone calls to elected officials advocating for policy change on racial issues",
    "Support small businesses owned by people of color in your community",
    "Volunteer to help with voter registration drives in communities of color",
    "Attend a meeting of the local Equal Justice Initiative chapter",
    "Organize a community event focused on racial justice education",
    "Mentor or tutor students of color in your community",
    "Participate in a racial justice documentary screening and discussion"
  ],
  "Sexism": [
    "Volunteer at a women's rights organization",
    "Attend a workshop on gender equality and women's empowerment",
    "Support women-owned businesses in your community",
    "Advocate for equal pay legislation by contacting representatives",
    "Mentor a young woman in your field or community",
    "Participate in a women's march or rally",
    "Donate to organizations supporting women's reproductive rights",
    "Join a book club focused on feminist literature",
    "Attend a self-defense class and encourage others to join",
    "Volunteer at a domestic violence shelter",
    "Support candidates who prioritize women's rights",
    "Organize a discussion group on gender issues",
    "Participate in a fundraiser for women's health services",
    "Advocate for paid family leave policies",
    "Support Title IX enforcement in schools",
    "Volunteer with girls' empowerment programs",
    "Attend a workshop on combating sexual harassment",
    "Support survivors of sexual assault by volunteering with crisis centers",
    "Advocate for affordable childcare policies",
    "Participate in workshops on women's history and achievements"
  ],
  "Homo/Transphobia": [
    "Volunteer at an LGBTQ+ community center",
    "Attend a Pride parade or LGBTQ+ event in your community",
    "Donate to The Trevor Project or similar LGBTQ+ youth organization",
    "Advocate for anti-discrimination legislation for LGBTQ+ individuals",
    "Support LGBTQ+ owned businesses",
    "Become an ally by attending LGBTQ+ education workshops",
    "Volunteer with LGBTQ+ youth mentorship programs",
    "Participate in LGBTQ+ advocacy campaigns",
    "Support transgender individuals by advocating for inclusive bathroom policies",
    "Donate to organizations fighting conversion therapy",
    "Attend a GLAAD event or workshop",
    "Volunteer at an LGBTQ+ homeless youth shelter",
    "Support LGBTQ+ inclusive sex education in schools",
    "Advocate for LGBTQ+ inclusive healthcare",
    "Participate in fundraisers for LGBTQ+ causes",
    "Support LGBTQ+ elders programs",
    "Volunteer with LGBTQ+ crisis hotlines",
    "Advocate for LGBTQ+ representation in media",
    "Support LGBTQ+ refugees and asylum seekers",
    "Participate in campaigns against LGBTQ+ discrimination"
  ],
  "Threat of A.I.": [
    "Attend a workshop on digital privacy and online safety",
    "Advocate for stronger data privacy legislation",
    "Support organizations fighting for digital rights",
    "Educate yourself on AI ethics and bias",
    "Participate in campaigns for tech accountability",
    "Support workers affected by automation",
    "Advocate for universal basic income as automation increases",
    "Join discussions on ethical AI development",
    "Support digital literacy programs in underserved communities",
    "Advocate for regulation of facial recognition technology",
    "Participate in campaigns against surveillance capitalism",
    "Support net neutrality advocacy organizations",
    "Educate others about deepfakes and misinformation",
    "Advocate for algorithmic transparency",
    "Support workers' rights in the gig economy",
    "Participate in digital rights activism",
    "Advocate for AI safety research",
    "Support organizations fighting online harassment",
    "Participate in campaigns for ethical tech design",
    "Advocate for protection against AI-based discrimination"
  ],
  "Love & Romance": [
    "Volunteer at a domestic violence shelter",
    "Attend a workshop on healthy relationships",
    "Support reproductive rights organizations like Planned Parenthood",
    "Educate yourself on consent and healthy communication",
    "Volunteer with crisis hotlines for relationship abuse",
    "Support sex education programs in schools",
    "Attend couples counseling or relationship workshops",
    "Advocate for domestic violence prevention programs",
    "Support organizations fighting human trafficking",
    "Volunteer with teen dating violence prevention programs",
    "Attend workshops on emotional intelligence in relationships",
    "Support LGBTQ+ inclusive relationship resources",
    "Advocate for comprehensive sex education",
    "Volunteer with organizations supporting survivors of sexual assault",
    "Support reproductive health access initiatives",
    "Attend workshops on boundaries and self-care",
    "Advocate for paid parental leave policies",
    "Support organizations providing relationship counseling services",
    "Volunteer with programs supporting single parents",
    "Participate in campaigns against victim-blaming"
  ]
};

// SHARE challenges
const SHARE_TEMPLATES = {
  "Racism": [
    "Share a personal story of experiencing or witnessing racism",
    "Share a video or article about racial justice on social media",
    "Share a quote about racial justice on social media",
    "Share a photo or meme about racial justice on social media",
    "Share a poem or song about racial justice on social media",
    "Share a personal essay about racial justice on social media",
    "Share a video of a speech or talk about racial justice",
    "Perform a spoken word piece about racism and share it with others",
    "Share a post on social media about a current racial justice issue and encourage others to take action",
    "Lead a discussion on racism with a group of friends or coworkers",
    "Share a video about racial injustice and discuss it with others",
    "Share an article or book about racial justice with someone and discuss it",
    "Share a TikTok video made by a person of color with the hashtag #blacklivesmatter",
    "Create a TikTok video featuring a lyric from 'Some Justice Opportunity' about Michael Brown with #justiceforMichaelBrown",
    "Share a TikTok video that speaks to racism and how we can combat it in our society",
    "Share your family's story of immigration or migration",
    "Share resources about racial justice with your community",
    "Share a documentary about civil rights history",
    "Post about a racial justice hero who inspires you",
    "Share statistics about racial inequality to raise awareness"
  ],
  "Sexism": [
    "Share your story of experiencing sexism or gender discrimination",
    "Share resources about women's rights on social media",
    "Share a post celebrating women's achievements",
    "Share information about the gender wage gap",
    "Share resources for survivors of domestic violence",
    "Share a story about an inspiring woman in history",
    "Post about women's suffrage history",
    "Share information about reproductive rights",
    "Share resources about Title IX and education equity",
    "Share your experience with workplace discrimination",
    "Post about women in STEM fields",
    "Share resources for women's health",
    "Share information about paid family leave",
    "Post about women political leaders",
    "Share resources about sexual harassment prevention",
    "Share stories of women entrepreneurs",
    "Post about intersectional feminism",
    "Share resources for women's mental health",
    "Share information about girls' education globally",
    "Post about body positivity and fighting beauty standards"
  ],
  "Homo/Transphobia": [
    "Share your coming out story or an ally's story",
    "Share resources about LGBTQ+ rights on social media",
    "Share a post celebrating LGBTQ+ Pride",
    "Share information about The Trevor Project",
    "Share resources for LGBTQ+ youth",
    "Share a story about LGBTQ+ history",
    "Post about LGBTQ+ representation in media",
    "Share resources about gender identity education",
    "Share information about conversion therapy bans",
    "Share your experience as an LGBTQ+ person or ally",
    "Post about LGBTQ+ civil rights milestones",
    "Share resources for transgender individuals",
    "Share information about LGBTQ+ inclusive healthcare",
    "Post about chosen family and community",
    "Share resources about pronoun usage and respect",
    "Share stories of LGBTQ+ leaders and activists",
    "Post about intersectionality in LGBTQ+ rights",
    "Share resources for LGBTQ+ mental health",
    "Share information about same-sex marriage equality",
    "Post about LGBTQ+ inclusive education"
  ],
  "Threat of A.I.": [
    "Share your concerns about technology and privacy",
    "Share resources about digital privacy protection",
    "Share information about AI bias and discrimination",
    "Post about the impact of automation on workers",
    "Share resources about online safety",
    "Share your experience with technology changing society",
    "Post about surveillance capitalism concerns",
    "Share information about facial recognition risks",
    "Share resources about deepfakes and misinformation",
    "Post about the digital divide and access inequality",
    "Share information about algorithmic discrimination",
    "Share resources about protecting children online",
    "Post about tech workers' rights",
    "Share information about data breaches and security",
    "Share resources about ethical AI development",
    "Post about social media's impact on mental health",
    "Share information about gig economy worker protections",
    "Share resources about combating online harassment",
    "Post about the need for tech regulation",
    "Share information about net neutrality"
  ],
  "Love & Romance": [
    "Share your story of overcoming relationship challenges",
    "Share resources about healthy relationships",
    "Share information about consent and boundaries",
    "Post about recognizing red flags in relationships",
    "Share resources for domestic violence survivors",
    "Share your experience with therapy or counseling",
    "Post about the importance of self-love",
    "Share information about reproductive health",
    "Share resources about LGBTQ+ inclusive relationships",
    "Post about emotional intelligence in relationships",
    "Share information about recognizing abuse",
    "Share resources about communication in relationships",
    "Post about body autonomy and consent",
    "Share information about the National Domestic Violence Hotline",
    "Share resources about sex education",
    "Post about relationship equality and respect",
    "Share information about love bombing and manipulation",
    "Share resources about healing from toxic relationships",
    "Post about the importance of friendship and community",
    "Share information about reproductive rights and access"
  ]
};

// ALTERNATIVE challenges
const ALTERNATIVE_TEMPLATES = {
  "Racism": [
    "Create a TikTok dance to 'Some Justice Opportunity' with hashtag #justiceforall",
    "Do a dramatic reading of a speech by Martin Luther King Jr.",
    "Create a lip sync performance about racial justice",
    "Do an impression of a civil rights leader",
    "Create a TikTok video explaining why voting matters with #voteforchange",
    "Perform a spoken word piece about equality",
    "Create a dance routine celebrating diversity",
    "Do a karaoke performance of 'This My America'",
    "Create a comedy skit about breaking down racial barriers",
    "Perform a dramatic monologue about justice",
    "Create a TikTok featuring lyrics from 'Stand Up'",
    "Do a talent show performance promoting unity",
    "Create a music video celebrating diversity",
    "Perform a song about equality and justice",
    "Create an interpretive dance about the civil rights movement",
    "Do a dramatic reading of Maya Angelou's poetry",
    "Create a TikTok dance trend promoting racial justice",
    "Perform a skit about historical civil rights moments",
    "Create a lip sync to protest songs",
    "Do an impression of activists who inspire you"
  ],
  "Sexism": [
    "Create a TikTok about women's empowerment",
    "Perform a monologue from a play about women's rights",
    "Create a dance celebrating powerful women",
    "Do a lip sync to feminist anthems",
    "Create a comedy skit about smashing gender stereotypes",
    "Perform a spoken word piece about gender equality",
    "Create a TikTok featuring women in history",
    "Do a dramatic reading of feminist literature",
    "Create a talent show about women's achievements",
    "Perform a song about women's rights",
    "Create a TikTok dance to 'Please You' promoting self-love",
    "Do impressions of inspiring women leaders",
    "Create a music video about equal rights",
    "Perform a skit about workplace equality",
    "Create an interpretive dance about breaking barriers",
    "Do a karaoke performance of empowerment songs",
    "Create a TikTok promoting body positivity",
    "Perform a scene from a feminist play",
    "Create a comedy routine about gender double standards",
    "Do a lip sync challenge promoting women's rights"
  ],
  "Homo/Transphobia": [
    "Create a TikTok celebrating LGBTQ+ Pride",
    "Perform a monologue about acceptance and love",
    "Create a dance to celebrate diversity",
    "Do a lip sync with hashtag #loveislove",
    "Create a comedy skit promoting LGBTQ+ acceptance",
    "Perform a spoken word piece about identity",
    "Create a TikTok featuring LGBTQ+ history",
    "Do a dramatic reading of LGBTQ+ literature",
    "Create a talent show celebrating authenticity",
    "Perform a song about love and acceptance",
    "Create a TikTok dance promoting equality",
    "Do impressions celebrating LGBTQ+ icons",
    "Create a music video about being yourself",
    "Perform a skit about coming out stories",
    "Create an interpretive dance about identity",
    "Do a karaoke performance of LGBTQ+ anthems",
    "Create a TikTok promoting pronoun respect",
    "Perform a scene celebrating chosen family",
    "Create a comedy routine about LGBTQ+ experiences",
    "Do a lip sync to 'Come On, Come On' about self-confidence"
  ],
  "Threat of A.I.": [
    "Create a TikTok about protecting privacy online with #saveourplanet",
    "Perform a skit about AI taking over",
    "Create a dance about disconnecting from technology",
    "Do a lip sync about the digital age",
    "Create a comedy routine about technology fails",
    "Perform a spoken word piece about surveillance",
    "Create a TikTok about online safety",
    "Do a dramatic reading about technology's impact",
    "Create a talent show featuring analog skills",
    "Perform a song about digital rights",
    "Create a TikTok dance about human connection",
    "Do impressions of tech billionaires",
    "Create a music video about unplugging",
    "Perform a skit about deepfakes",
    "Create an interpretive dance about automation",
    "Do a karaoke performance about simpler times",
    "Create a TikTok promoting digital literacy",
    "Perform a scene about AI ethics",
    "Create a comedy routine about tech addiction",
    "Do a lip sync about protecting your data"
  ],
  "Love & Romance": [
    "Create a TikTok about consent and respect with #respectconsent",
    "Perform a love scene with emphasis on communication",
    "Create a dance celebrating healthy relationships",
    "Do a lip sync to 'Moonlight Summer Dance'",
    "Create a comedy skit about dating",
    "Perform a spoken word piece about self-love",
    "Create a TikTok about recognizing red flags",
    "Do a dramatic reading of love poetry",
    "Create a talent show about relationship skills",
    "Perform a song about healthy love",
    "Create a TikTok dance to 'The Love' with #thelove",
    "Do impressions of healthy vs unhealthy relationships",
    "Create a music video about self-respect",
    "Perform a skit about boundaries",
    "Create an interpretive dance about emotional connection",
    "Do a karaoke performance of love songs",
    "Create a TikTok promoting emotional intelligence",
    "Perform a scene about consent education",
    "Create a comedy routine about modern dating",
    "Do a lip sync to 'She's Takin' Me With Her' with #shestakinme"
  ]
};

async function generateChallenges() {
  console.log("Fetching songs from database...");
  
  // Get all songs
  const songs = await sql`SELECT id, title FROM songs ORDER BY created_at`;
  
  if (songs.length === 0) {
    console.log("No songs found in database!");
    return;
  }
  
  console.log(`Found ${songs.length} songs`);
  
  const challenges: any[] = [];
  
  // For each song
  for (const song of songs) {
    console.log(`\nGenerating challenges for: ${song.title}`);
    
    // For each of 4 segments
    for (let segment = 1; segment <= 4; segment++) {
      console.log(`  Segment ${segment}:`);
      
      // For each category
      for (const category of CATEGORIES) {
        // KNOW challenges (5 per category per segment)
        const knowQuestions = KNOW_CHALLENGES[category as keyof typeof KNOW_CHALLENGES] || [];
        for (let i = 0; i < 5; i++) {
          const question = knowQuestions[i % knowQuestions.length];
          challenges.push({
            songId: song.id,
            segment,
            category,
            type: "KNOW",
            title: `${category} History Question #${i + 1}`,
            description: question.q,
            points: question.points
          });
        }
        
        // ACTION challenges (5 per category per segment)
        const actionTemplates = ACTION_TEMPLATES[category as keyof typeof ACTION_TEMPLATES] || [];
        for (let i = 0; i < 5; i++) {
          const action = actionTemplates[i % actionTemplates.length];
          challenges.push({
            songId: song.id,
            segment,
            category,
            type: "ACTION",
            title: `Take Action for ${category} #${i + 1}`,
            description: action,
            points: 50 + (i * 10) // 50, 60, 70, 80, 90
          });
        }
        
        // SHARE challenges (5 per category per segment)
        const shareTemplates = SHARE_TEMPLATES[category as keyof typeof SHARE_TEMPLATES] || [];
        for (let i = 0; i < 5; i++) {
          const share = shareTemplates[i % shareTemplates.length];
          challenges.push({
            songId: song.id,
            segment,
            category,
            type: "SHARE",
            title: `Share Your Voice on ${category} #${i + 1}`,
            description: share,
            points: 30 + (i * 10) // 30, 40, 50, 60, 70
          });
        }
        
        // ALTERNATIVE challenges (5 per category per segment)
        const altTemplates = ALTERNATIVE_TEMPLATES[category as keyof typeof ALTERNATIVE_TEMPLATES] || [];
        for (let i = 0; i < 5; i++) {
          const alt = altTemplates[i % altTemplates.length];
          challenges.push({
            songId: song.id,
            segment,
            category,
            type: "ALTERNATIVE",
            title: `Creative Challenge: ${category} #${i + 1}`,
            description: alt,
            points: 40 + (i * 15) // 40, 55, 70, 85, 100
          });
        }
      }
      
      console.log(`    Generated 100 challenges (20 per category × 5 categories)`);
    }
  }
  
  console.log(`\n\nTotal challenges generated: ${challenges.length}`);
  console.log(`Expected: ${songs.length} songs × 4 segments × 20 challenges = ${songs.length * 4 * 20}`);
  
  // Insert in batches
  console.log("\nInserting challenges into database...");
  const batchSize = 100;
  
  for (let i = 0; i < challenges.length; i += batchSize) {
    const batch = challenges.slice(i, i + batchSize);
    
    for (const challenge of batch) {
      await sql`
        INSERT INTO challenges (song_id, segment, category, type, title, description, points)
        VALUES (${challenge.songId}, ${challenge.segment}, ${challenge.category}, 
                ${challenge.type}, ${challenge.title}, ${challenge.description}, ${challenge.points})
      `;
    }
    
    console.log(`  Inserted ${Math.min(i + batchSize, challenges.length)}/${challenges.length} challenges`);
  }
  
  console.log("\n✅ All challenges imported successfully!");
  
  // Show summary
  const summary = await sql`
    SELECT 
      s.title as song,
      c.segment,
      c.category,
      c.type,
      COUNT(*) as count
    FROM challenges c
    JOIN songs s ON c.song_id = s.id
    GROUP BY s.title, c.segment, c.category, c.type
    ORDER BY s.title, c.segment, c.category, c.type
    LIMIT 50
  `;
  
  console.log("\n📊 Sample distribution (first 50 rows):");
  console.table(summary);
}

generateChallenges()
  .then(() => {
    console.log("\n✅ Import complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
