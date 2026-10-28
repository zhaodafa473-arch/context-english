/* 语境英语 · 内容层
 * 每篇文章 = 一篇可读的原文 + 语境词条 + 语法点 + 跟读句 + 写作题
 * 词条字段说明见 README
 */
window.APP_DATA = {
  version: 1,
  articles: [
    /* ============================================================
     * 1. 外刊评论
     * ============================================================ */
    {
      id: 'books',
      kind: 'press',
      kindLabel: '外刊评论',
      title: 'Why We Keep Buying Books We Never Read',
      subtitle: '关于「买了不读」',
      level: 'B1+',
      intro: '作者从自己的书架写起，先自嘲，再讲一个日本词，最后给了一个很温柔的解法。适合练「让步 + 转折」的论证结构。',
      tip: '读的时候注意：每一段都在回答上一段留下的问题。',
      paragraphs: [
        { text: "Every few months, the same thing happens to me. I walk into a bookshop, pick up a book with a beautiful cover, read the first page, and decide that this is the book that will change my life. I buy it, carry it home, and place it on the shelf. Then it sits there, untouched, for three years." },
        { text: "The Japanese have a word for this: tsundoku — the habit of buying books and letting them pile up unread. It sounds like a joke, but it points at something real. We do not buy books only to read them. We buy them to become the kind of person who has read them. Each unread book is a small promise we make to a future version of ourselves." },
        { text: "There is a certain comfort in that promise. A shelf full of books suggests a mind that is still curious, still ambitious, still planning to grow. The trouble is that the shelf slowly turns from an inspiration into a reminder of everything we have failed to do. The books begin to feel less like friends and more like debts." },
        { text: "Perhaps the answer is not to stop buying books but to lower our expectations. A book does not have to change your life. It only has to give you one good afternoon. If you read twenty pages and put it down, you have not failed; you have simply met a book at the wrong time, and you are allowed to meet it again later." }
      ],
      vocab: [
        {
          id: 'untouched',
          word: 'untouched',
          forms: ['untouched'],
          pos: 'adj.',
          ipa: '/ˌʌnˈtʌtʃt/',
          zh: '未被动过的；保持原样的',
          sense: '这里指书买回来之后一直放在架子上，从来没被翻开过。',
          sent: 'Then it sits there, untouched, for three years.',
          morph: [{ p: 'un-', g: '否定，「不」' }, { p: 'touch', g: '碰' }, { p: '-ed', g: '被…的' }],
          note: 'un- 加过去分词，表示「没有被…过」：unread 没读过、unopened 没拆封、unsold 没卖出。',
          colloc: [{ en: 'sit untouched', zh: '原封不动地放着' }, { en: 'leave sth untouched', zh: '不去动某物' }],
          contrast: { with: 'intact', diff: 'intact 强调「完整无损」，untouched 强调「没人碰过」。没拆封的礼物是 untouched，摔不碎的杯子是 intact。' },
          register: '中性，书面口语都常见',
          why: '比 never opened 更简洁，还暗示「它一直在那儿等你」，带一点内疚。'
        },
        {
          id: 'pileup',
          word: 'pile up',
          forms: ['pile', 'piles', 'piled'],
          pos: 'phrasal v.',
          ipa: '/paɪl ʌp/',
          zh: '堆积；越积越多',
          sense: '指书一本本买回来，摞在那里没读。',
          sent: "The Japanese have a word for this: tsundoku — the habit of buying books and letting them pile up unread.",
          morph: [{ p: 'pile', g: '摞、堆' }, { p: 'up', g: '向上、聚拢' }],
          note: 'up 在这里表示「数量增加、累积」：eat up 吃光、use up 用光、build up 积累。',
          colloc: [{ en: 'let sth pile up', zh: '任由…堆积' }, { en: 'a pile of books', zh: '一摞书' }],
          contrast: { with: 'accumulate', diff: 'accumulate 更正式、更书面，常用于数据、财富、债务；pile up 更口语、更有画面感，而且暗示「没人管」。' },
          register: '口语常用',
          why: '画面感强：书是真的摞起来了，不只是数量增加。'
        },
        {
          id: 'unread',
          word: 'unread',
          forms: ['unread'],
          pos: 'adj.',
          ipa: '/ˌʌnˈred/',
          zh: '未读的；（书）没读过的',
          sense: '指买了但一直没读的书。',
          sent: "The Japanese have a word for this: tsundoku — the habit of buying books and letting them pile up unread.",
          morph: [{ p: 'un-', g: '否定，「不」' }, { p: 'read', g: '读（过去分词）' }],
          note: '注意和 unreadable 的区别：unreadable 是「读不下去的、难以卒读的」。',
          colloc: [{ en: 'an unread message', zh: '一条未读消息' }, { en: 'sit unread', zh: '一直没被读' }],
          contrast: { with: 'unreadable', diff: 'unread 是「还没读」，unreadable 是「读不了 / 写得太烂读不下去」。差一个 -able，意思完全反了。' },
          register: '中性',
          why: '和前面的 untouched 呼应，形成「未动 + 未读」的双重意象。'
        },
        {
          id: 'suggest',
          word: 'suggest',
          forms: ['suggest', 'suggests', 'suggested', 'suggesting'],
          pos: 'v.',
          ipa: '/səˈdʒest/',
          zh: '暗示；表明（另有「建议」义，本句不是）',
          sense: '这里的 suggests 是「说明、表明」，不是「建议」。',
          sent: 'A shelf full of books suggests a mind that is still curious, still ambitious, still planning to grow.',
          morph: [{ p: 'sug-', g: '= sub-，在下' }, { p: 'gest', g: '带来' }],
          note: 'suggest that 从句用陈述语气（suggests that it is），不用 should，这一点和中文「建议」的语感不同。',
          colloc: [{ en: 'suggest that...', zh: '表明…' }, { en: 'suggest doing sth', zh: '建议做某事' }],
          contrast: { with: 'imply', diff: 'imply 是「话里有话」，暗示者是说话人；suggest 是「证据、现象指向某个结论」。书架 suggests 你的性格，他说那句话 implies 他不高兴。' },
          register: '中性偏正式',
          why: '一个动词同时表达「看起来像」和「说明了」，比 shows 更含蓄。'
        },
        {
          id: 'curious',
          word: 'curious',
          forms: ['curious'],
          pos: 'adj.',
          ipa: '/ˈkjʊəriəs/',
          zh: '好奇的；求知欲强的',
          sense: '指「还对世界感兴趣」的那种心态。',
          sent: 'A shelf full of books suggests a mind that is still curious, still ambitious, still planning to grow.',
          morph: [{ p: 'cur', g: '关心、在意' }, { p: '-ious', g: '…的' }],
          note: 'curious 还有「奇怪的」意思（a curious noise 一种奇怪的声音），靠语境分辨。',
          colloc: [{ en: 'be curious about sth', zh: '对…好奇' }, { en: 'out of curiosity', zh: '出于好奇' }],
          contrast: { with: 'interested', diff: 'interested 是对某件具体的事感兴趣；curious 更强调「想知道答案」的冲动，范围更广，也更像一种性格。' },
          register: '中性',
          why: '和后面的 ambitious 并列：一个向外（好奇），一个向前（抱负）。'
        },
        {
          id: 'ambitious',
          word: 'ambitious',
          forms: ['ambitious'],
          pos: 'adj.',
          ipa: '/æmˈbɪʃəs/',
          zh: '有抱负的；有野心的',
          sense: '这里指「还想往上走、还想成长」。',
          sent: 'A shelf full of books suggests a mind that is still curious, still ambitious, still planning to grow.',
          morph: [{ p: 'amb-', g: '周围' }, { p: 'it', g: '走' }, { p: '-ious', g: '…的' }],
          note: '中文说「野心」偏贬义，英文 ambitious 多数语境是褒义。',
          colloc: [{ en: 'an ambitious plan', zh: '宏大的计划' }, { en: 'be ambitious for sb', zh: '对某人有很高期望' }],
          contrast: { with: 'aspiring', diff: 'aspiring 是「想成为…的」，只修饰人（aspiring writer 有志成为作家的人）；ambitious 可以修饰计划、目标、项目。' },
          register: '中性偏褒',
          why: '三个 still 排比，最后一个词必须比 curious 更用力，句子才立得住。'
        },
        {
          id: 'inspiration',
          word: 'inspiration',
          forms: ['inspiration'],
          pos: 'n.',
          ipa: '/ˌɪnspəˈreɪʃn/',
          zh: '灵感；激励（源）',
          sense: '指书架原本给人的那种鼓舞。',
          sent: 'The trouble is that the shelf slowly turns from an inspiration into a reminder of everything we have failed to do.',
          morph: [{ p: 'in-', g: '向内' }, { p: 'spir', g: '呼吸' }, { p: '-ation', g: '名词后缀' }],
          note: '同根词：spirit 精神、respire 呼吸、perspire 出汗。',
          colloc: [{ en: 'a source of inspiration', zh: '灵感来源' }, { en: 'draw inspiration from sth', zh: '从…中汲取灵感' }],
          contrast: { with: 'motivation', diff: 'motivation 是「让你开始做事的动力」，在内；inspiration 是「让你产生想法的东西」，在外。' },
          register: '中性',
          why: '和后面的 reminder 形成对照：inspiration 朝前看，reminder 朝后看。'
        },
        {
          id: 'reminder',
          word: 'reminder',
          forms: ['reminder'],
          pos: 'n.',
          ipa: '/rɪˈmaɪndə(r)/',
          zh: '提醒（物）；让人想起某事的东西',
          sense: '书架不再激励人，反而成了「你没做到」的证据。',
          sent: 'The trouble is that the shelf slowly turns from an inspiration into a reminder of everything we have failed to do.',
          morph: [{ p: 're-', g: '再次' }, { p: 'mind', g: '想' }, { p: '-er', g: '…的东西' }],
          note: 'a reminder that... / a reminder of... 两种搭配都常见。',
          colloc: [{ en: 'a constant reminder of sth', zh: '不断提醒你…的东西' }, { en: 'serve as a reminder', zh: '起到提醒作用' }],
          contrast: { with: 'memory', diff: 'reminder 是「外部的、让你想起的东西」，memory 是「你脑子里的记忆」。书架是 reminder，回忆是 memory。' },
          register: '中性',
          why: '这个词自带「被动、不情愿被提醒」的语气，正好接住前半句的 inspiration。'
        },
        {
          id: 'debt',
          word: 'debt',
          forms: ['debt', 'debts'],
          pos: 'n.',
          ipa: '/det/',
          zh: '债；欠下的东西（本句是比喻）',
          sense: '把没读的书比作「欠下的债」。',
          sent: 'The books begin to feel less like friends and more like debts.',
          morph: [{ p: 'debt', g: '源自拉丁 debitum「欠下的东西」' }],
          note: 'b 不发音。同源词：debit 借记、debtor 债务人。',
          colloc: [{ en: 'be in debt', zh: '欠债' }, { en: 'pay off a debt', zh: '还清债务' }],
          contrast: { with: 'obligation', diff: 'debt 强调「你欠了东西、迟早要还」；obligation 强调「责任、义务」，不一定欠了什么。' },
          register: '中性；本句是修辞用法',
          why: '把书比作债，一句话就说清了「未读」带来的心理负担。'
        },
        {
          id: 'expectation',
          word: 'expectation',
          forms: ['expectation', 'expectations'],
          pos: 'n.',
          ipa: '/ˌekspekˈteɪʃn/',
          zh: '期望；预期',
          sense: '指对「读完一本书」这件事的期待。',
          sent: 'Perhaps the answer is not to stop buying books but to lower our expectations.',
          morph: [{ p: 'ex-', g: '向外' }, { p: 'spect', g: '看' }, { p: '-ation', g: '名词后缀' }],
          note: '同根词：inspect 检查、respect 尊重、prospect 前景。',
          colloc: [{ en: "lower one's expectations", zh: '降低期望' }, { en: 'meet expectations', zh: '达到预期' }],
          contrast: { with: 'hope', diff: 'expectation 更接近「我认为会发生」，hope 是「我希望发生」。lower expectations 是调整判断，不是放弃希望。' },
          register: '中性',
          why: 'lower 这个动词很关键：不是放弃，是调低刻度。'
        }
      ],
      grammar: [
        {
          point: '定语从句省略关系代词',
          sent: 'Each unread book is a small promise we make to a future version of ourselves.',
          explain: 'we make 前面省略了 that / which。先行词 a small promise 在从句里作 make 的宾语，所以关系代词可以省略。判断方法：把先行词放回从句 —— we make <b>a promise</b> to a future version —— 缺宾语，就可以省。',
          drills: [
            'The book (that) I bought last week is still on my desk. 我上周买的那本书还在桌上。',
            'This is the person (who) I told you about. 这就是我跟你说过的那个人。',
            'The promise (that) we made to ourselves is easy to forget. 我们对自己许下的承诺很容易被忘掉。'
          ]
        },
        {
          point: 'not A but B 平行结构',
          sent: 'Perhaps the answer is not to stop buying books but to lower our expectations.',
          explain: 'not 和 but 后面接的成分必须对称。这里两边都是 to do（不定式）。最常见的错误是写 not to do but do，两边不对称。',
          drills: [
            'The problem is not to find time but to use it. 问题不是找时间，而是用时间。',
            'She did not complain but waited quietly. 她没有抱怨，只是安静地等着。',
            'It is not a matter of talent but of practice. 这不是天赋问题，而是练习问题。'
          ]
        }
      ],
      shadow: [
        'I walk into a bookshop, pick up a book with a beautiful cover, read the first page, and decide that this is the book that will change my life.',
        'We buy them to become the kind of person who has read them.',
        'The books begin to feel less like friends and more like debts.'
      ],
      writing: {
        prompt: "用 suggest、expectation、debt 三个词，写 3 句话，说说你自己的「未读书架」。",
        hint: '先写事实，再写它说明了什么，最后写你的感受。',
        mustUse: ['suggest', 'expectation', 'debt'],
        model: 'I have eleven books on my desk that I have never opened. My shelf suggests a person who reads every night, but in truth I watch videos instead. The debt is small, but it is there, and lowering my expectations feels like the only honest way to pay it.'
      }
    },

    /* ============================================================
     * 2. 生活场景对话
     * ============================================================ */
    {
      id: 'flat',
      kind: 'dialogue',
      kindLabel: '生活对话',
      title: 'Renting a Flat in the City',
      subtitle: '看房、押金、砍价',
      level: 'B1',
      intro: '中介带看房的一段真实对话。押金、租约、家具、砍价，一次听全。对话是练「说」最好的材料，因为它本来就是口语。',
      tip: '先别读，听两遍，抓住数字（租金、押金、月数）再回来看原文。',
      paragraphs: [
        { sp: 'Daniel', text: "Good morning — you must be Mia. I'm Daniel, from the agency. Come in, the flat has just been cleaned." },
        { sp: 'Mia', text: "Thanks. It looks brighter than the photos." },
        { sp: 'Daniel', text: "It faces south, so it gets sun most of the day. The rent is 1,450 a month, and that includes water but not electricity." },
        { sp: 'Mia', text: 'And the deposit?' },
        { sp: 'Daniel', text: 'One month of rent, held in a separate account. You get it back when you leave, as long as nothing is damaged.' },
        { sp: 'Mia', text: 'The lease is for a year, right? What happens if I need to move out earlier?' },
        { sp: 'Daniel', text: "You can leave after six months if you give two months' notice. It's written into the contract — clause 4." },
        { sp: 'Mia', text: 'OK. Is the flat furnished?' },
        { sp: 'Daniel', text: "Partly. There's a bed, a wardrobe and a table, but no sofa. The previous tenant took it with her." },
        { sp: 'Mia', text: "I see. And how's the neighbourhood? It seems quiet." },
        { sp: 'Daniel', text: "Very quiet at night, but there's a market on Saturdays. The neighbours are mostly families. The couple upstairs have lived here for eleven years." },
        { sp: 'Mia', text: "That's a good sign. The only problem is the price. It's a little above what I can afford." },
        { sp: 'Daniel', text: "Between us, the flat has been empty for five weeks. I could ask the landlord whether he would accept 1,380." },
        { sp: 'Mia', text: "If he would, I'd take it today." },
        { sp: 'Daniel', text: 'Let me call him. Give me two minutes.' }
      ],
      vocab: [
        {
          id: 'deposit',
          word: 'deposit',
          forms: ['deposit'],
          pos: 'n.',
          ipa: '/dɪˈpɒzɪt/',
          zh: '押金；定金',
          sense: '租房时先付、退租时（房子没损坏）会退还的那笔钱。',
          sent: 'One month of rent, held in a separate account. You get it back when you leave, as long as nothing is damaged.',
          morph: [{ p: 'de-', g: '向下' }, { p: 'posit', g: '放' }],
          note: 'deposit 作动词是「存放、存入」：deposit money in a bank。',
          colloc: [{ en: 'pay a deposit', zh: '付押金' }, { en: "a deposit of two months' rent", zh: '两个月房租的押金' }],
          contrast: { with: 'advance', diff: 'deposit 是押着、最后要还的；advance 是提前付的、不还的（advance payment 预付款）。' },
          register: '中性，租房和银行都用',
          why: '英式口语就说 deposit，美式更常说 security deposit。'
        },
        {
          id: 'lease',
          word: 'lease',
          forms: ['lease'],
          pos: 'n.',
          ipa: '/liːs/',
          zh: '租约；租期',
          sense: '写明能住多久、每月付多少的那份合同。',
          sent: 'The lease is for a year, right?',
          morph: [{ p: 'lease', g: '源自古法语 lais「让渡」，与 release 同源' }],
          note: '作动词也常用：lease a flat 租下一套房。',
          colloc: [{ en: 'sign a lease', zh: '签租约' }, { en: 'a two-year lease', zh: '两年的租约' }],
          contrast: { with: 'contract', diff: 'lease 专指「不动产的租赁合同」，contract 是任何合同。租房一定说 lease，不说 rent contract。' },
          register: '正式，法律用语',
          why: '比 contract 更精确，一开口就显得懂行。'
        },
        {
          id: 'furnished',
          word: 'furnished',
          forms: ['furnished', 'furnish'],
          pos: 'adj.',
          ipa: '/ˈfɜːnɪʃt/',
          zh: '（房间）带家具的',
          sense: '指房东提供床、桌子、衣柜等基本家具。',
          sent: 'Is the flat furnished?',
          morph: [{ p: 'furnish', g: '配备家具' }, { p: '-ed', g: '…的' }],
          note: '反义词 unfurnished 不带家具；中间状态半配可以说 partly furnished。',
          colloc: [{ en: 'a furnished flat', zh: '带家具的公寓' }, { en: 'fully furnished', zh: '家具齐全的' }],
          contrast: { with: 'equipped', diff: 'furnished 专指家具；equipped 指设备（厨房设备、健身器材）。' },
          register: '中性，租房广告高频词',
          why: '租房广告里 furnished / unfurnished 是必看的一个词。'
        },
        {
          id: 'tenant',
          word: 'tenant',
          forms: ['tenant', 'tenants'],
          pos: 'n.',
          ipa: '/ˈtenənt/',
          zh: '租客；承租人',
          sense: '租房子住的人，相对于 landlord。',
          sent: 'The previous tenant took it with her.',
          morph: [{ p: 'ten', g: '握住、持有' }, { p: '-ant', g: '人' }],
          note: '同根词：tenure 任期 / 终身教职、maintain 维持（用手握住）。',
          colloc: [{ en: 'the previous tenant', zh: '上一任租客' }, { en: "tenant's rights", zh: '租客权利' }],
          contrast: { with: 'resident', diff: 'tenant 强调「租的」；resident 只强调「住在这里」，自己买房住的也是 resident。' },
          register: '中性偏正式',
          why: '问一句「上一任租客住了多久」，是租房时最实用的一招。'
        },
        {
          id: 'neighbourhood',
          word: 'neighbourhood',
          forms: ['neighbourhood', 'neighborhood'],
          pos: 'n.',
          ipa: '/ˈneɪbəhʊd/',
          zh: '街区；社区',
          sense: '房子周围那一片，包括邻居和环境。',
          sent: "And how's the neighbourhood? It seems quiet.",
          morph: [{ p: 'neighbour', g: '邻居' }, { p: '-hood', g: '状态、范围' }],
          note: '美式拼写 neighborhood。-hood 后缀：childhood 童年、adulthood 成年。',
          colloc: [{ en: 'a quiet neighbourhood', zh: '安静的街区' }, { en: 'in the neighbourhood', zh: '在附近一带' }],
          contrast: { with: 'area', diff: 'neighbourhood 特指「有人住的社区」，带人文色彩；area 只是「一片区域」，可以是空的。' },
          register: '中性',
          why: '问 neighbourhood 不只是问地段，还问了「住在这儿的是什么人」。'
        },
        {
          id: 'afford',
          word: 'afford',
          forms: ['afford', 'affords', 'afforded'],
          pos: 'v.',
          ipa: '/əˈfɔːd/',
          zh: '负担得起',
          sense: '指价格超出预算，付不起。',
          sent: "It's a little above what I can afford.",
          morph: [{ p: 'af-', g: '= ad-，朝向' }, { p: 'ford', g: '古英语 forthian「推进、完成」' }],
          note: '几乎总跟 can / could 连用：can afford to do sth。',
          colloc: [{ en: "can't afford to do sth", zh: '负担不起做某事' }, { en: 'afford the rent', zh: '付得起房租' }],
          contrast: { with: 'pay', diff: 'pay 是「实际付了钱」；afford 是「付得起」，还没付。I can not afford it 意思是我不会买。' },
          register: '中性',
          why: '说 above what I can afford，比 too expensive 委婉得多，谈判时更好用。'
        },
        {
          id: 'landlord',
          word: 'landlord',
          forms: ['landlord'],
          pos: 'n.',
          ipa: '/ˈlændlɔːd/',
          zh: '房东',
          sense: '房子的所有者，收租的人。',
          sent: 'I could ask the landlord whether he would accept 1,380.',
          morph: [{ p: 'land', g: '土地' }, { p: 'lord', g: '主人' }],
          note: '女房东是 landlady，但现代英语里 landlord 也可以通用。',
          colloc: [{ en: 'ask the landlord', zh: '问房东' }, { en: "the landlord's permission", zh: '房东的许可' }],
          contrast: { with: 'owner', diff: 'landlord 专指出租房子的所有者；owner 只是「所有者」，自己住的房子也叫 owner。' },
          register: '中性，英式美式通用',
          why: '口语里说 the landlord 比 the owner 自然得多。'
        },
        {
          id: 'notice',
          word: 'notice',
          forms: ['notice'],
          pos: 'n.',
          ipa: '/ˈnəʊtɪs/',
          zh: '通知；预告（提前告知）',
          sense: "give two months' notice = 提前两个月通知对方要搬走。",
          sent: "You can leave after six months if you give two months' notice.",
          morph: [{ p: 'not', g: '知道' }, { p: '-ice', g: '名词后缀' }],
          note: 'notice 作动词是「注意到」，也是高频用法：I noticed the door was open.',
          colloc: [{ en: 'give notice', zh: '提出（退租 / 辞职）通知' }, { en: 'at short notice', zh: '临时通知' }],
          contrast: { with: 'warning', diff: 'notice 是「正式的、按约定的通知」；warning 是「警告」，带危险意味。' },
          register: '中性偏正式，合同高频',
          why: '这是合同里最容易吃亏的一条，记住 give notice 这个搭配。'
        },
        {
          id: 'contract',
          word: 'contract',
          forms: ['contract'],
          pos: 'n.',
          ipa: '/ˈkɒntrækt/',
          zh: '合同',
          sense: '写明双方权利义务的文件。',
          sent: "It's written into the contract — clause 4.",
          morph: [{ p: 'con-', g: '共同' }, { p: 'tract', g: '拉' }],
          note: '名词重音在前 /ˈkɒntrækt/，动词「收缩、感染」重音在后 /kənˈtrækt/。',
          colloc: [{ en: 'sign a contract', zh: '签合同' }, { en: 'break a contract', zh: '违约' }],
          contrast: { with: 'agreement', diff: 'contract 有法律效力；agreement 可以只是口头的一致。' },
          register: '正式',
          why: 'written into the contract 就是「白纸黑字写进合同」，谈判时的护身符。'
        },
        {
          id: 'previous',
          word: 'previous',
          forms: ['previous'],
          pos: 'adj.',
          ipa: '/ˈpriːviəs/',
          zh: '以前的；上一个的',
          sense: '指在这之前住在这儿的那位租客。',
          sent: 'The previous tenant took it with her.',
          morph: [{ p: 'pre-', g: '在前' }, { p: 'vi', g: '路' }, { p: '-ous', g: '…的' }],
          note: 'previous 常和 to 连用：previous to 2020 = 2020 年之前。',
          colloc: [{ en: 'the previous tenant', zh: '上一任租客' }, { en: 'previous experience', zh: '以往经验' }],
          contrast: { with: 'last', diff: 'previous 更书面、更中性；last 更口语，而且 the last tenant 有时会被听成「最后一位租客」。' },
          register: '中性偏正式',
          why: '用 previous 而不是 last，避免歧义。'
        }
      ],
      grammar: [
        {
          point: 'as long as 引导条件状语从句',
          sent: 'You get it back when you leave, as long as nothing is damaged.',
          explain: 'as long as = 只要，语气比 if 更强，暗示「这是唯一的条件」。从句用一般现在时表将来（主将从现）。is damaged 是被动语态：东西「被弄坏」。',
          drills: [
            'You can stay as long as you pay the rent on time. 只要按时交租，你就能住下去。',
            "As long as it doesn't rain, we'll walk. 只要不下雨，我们就走过去。",
            'The deposit is returned as long as nothing is broken. 只要没弄坏东西，押金就退还。'
          ]
        },
        {
          point: 'whether 宾语从句 + 委婉语气',
          sent: 'I could ask the landlord whether he would accept 1,380.',
          explain: 'whether = 是否，比 if 更正式，尤其在动词后面。could 加 would 不是过去时，而是「试探、留余地」：不是承诺，是探口风。这是砍价时最自然的一句。',
          drills: [
            'I wonder whether he would take 1,300. 我想知道他会不会接受 1300。',
            'She asked whether the flat was still available. 她问那套房还在不在。',
            'Could you check whether the deposit is refundable? 你能查一下押金能不能退吗？'
          ]
        }
      ],
      shadow: [
        "You can leave after six months if you give two months' notice.",
        "It's a little above what I can afford.",
        "If he would, I'd take it today."
      ],
      writing: {
        prompt: '用 deposit、afford、neighbourhood 写 3 句话，描述你理想中的租房条件。',
        hint: '一句写位置，一句写钱，一句写你的底线。',
        mustUse: ['deposit', 'afford', 'neighbourhood'],
        model: 'I want a small flat in a quiet neighbourhood, ten minutes from the metro. My budget is 2,000 a month, and the deposit is the part I cannot afford all at once. If the landlord agrees to take it in two payments, I will sign this week.'
      }
    },

    /* ============================================================
     * 3. 学术说明文
     * ============================================================ */
    {
      id: 'sleep',
      kind: 'academic',
      kindLabel: '学术说明',
      title: 'Why Sleep Matters More Than You Think',
      subtitle: '睡眠、记忆与情绪',
      level: 'B2',
      intro: '雅思阅读风格的说明文：先推翻旧观点，再给证据，再讲机制，最后落到「所以呢」。这个「旧观点 → 证据 → 推论 → 启示」的四步结构，就是雅思大作文的骨架。',
      tip: '读第二遍时，把每段的第一句单独抄下来，你会看到一整篇文章的骨架。',
      paragraphs: [
        { text: 'For a long time, sleep was regarded as a passive state — a period in which the brain simply switched off. Modern research has overturned that view. During sleep, the brain is remarkably active, replaying the day\'s experiences, strengthening important memories and discarding what it considers irrelevant.' },
        { text: 'One of the most consistent findings is that sleep improves learning. In a well-known experiment, participants who slept after studying a list of words recalled significantly more of them than those who stayed awake for the same period. The effect was strongest for material that participants had expected to be tested on, which suggests that the brain prioritises information it judges to be important.' },
        { text: 'Sleep also appears to play a role in emotional regulation. People who are deprived of sleep tend to overreact to minor frustrations and to interpret neutral faces as threatening. This may explain why a single bad night can make an ordinary day feel unusually difficult.' },
        { text: 'None of this means that sleep is a substitute for effort. Rather, it is the condition under which effort produces results. Students who cut sleep in order to study more are, in effect, borrowing time at a very high rate of interest.' },
        { text: 'The practical implication is simple, if inconvenient: the hours before midnight are not more valuable than the hours after it, and no amount of coffee corrects a chronic sleep deficit. Treating sleep as an optional extra is, on the evidence, one of the least efficient decisions a learner can make.' }
      ],
      vocab: [
        {
          id: 'passive',
          word: 'passive',
          forms: ['passive'],
          pos: 'adj.',
          ipa: '/ˈpæsɪv/',
          zh: '被动的；消极的',
          sense: '指「什么都不做、只是承受」的状态。',
          sent: 'For a long time, sleep was regarded as a passive state — a period in which the brain simply switched off.',
          morph: [{ p: 'pass', g: '承受' }, { p: '-ive', g: '…的' }],
          note: '被动语态就叫 passive voice，同一个词根。',
          colloc: [{ en: 'a passive attitude', zh: '消极的态度' }, { en: 'passive smoking', zh: '被动吸烟' }],
          contrast: { with: 'inactive', diff: 'inactive 只是「没在活动」，中性；passive 暗示「该动而不动」，常带批评意味。' },
          register: '中性偏学术',
          why: '和后面的 remarkably active 形成强烈反差，是这一段的关键动作。'
        },
        {
          id: 'overturn',
          word: 'overturn',
          forms: ['overturn', 'overturned', 'overturns'],
          pos: 'v.',
          ipa: '/ˌəʊvəˈtɜːn/',
          zh: '推翻；颠覆',
          sense: '指新研究推翻了旧看法。',
          sent: 'Modern research has overturned that view.',
          morph: [{ p: 'over', g: '翻转' }, { p: 'turn', g: '转' }],
          note: '法律语境也常用：The court overturned the decision. 法院推翻了判决。',
          colloc: [{ en: 'overturn a decision', zh: '推翻决定' }, { en: 'overturn an assumption', zh: '颠覆一个假设' }],
          contrast: { with: 'reject', diff: 'reject 是「拒绝接受」；overturn 是「用新证据把原来的结论翻过来」，更有力，也更学术。' },
          register: '正式、学术',
          why: '一个动词交代了「旧观点 → 新证据 → 结论反转」整个过程。'
        },
        {
          id: 'consistent',
          word: 'consistent',
          forms: ['consistent'],
          pos: 'adj.',
          ipa: '/kənˈsɪstənt/',
          zh: '一致的；持续稳定的',
          sense: '指多次研究都得到同样的结果。',
          sent: 'One of the most consistent findings is that sleep improves learning.',
          morph: [{ p: 'con-', g: '共同' }, { p: 'sist', g: '站' }, { p: '-ent', g: '…的' }],
          note: 'consistent with = 与…一致，是很常见的搭配。',
          colloc: [{ en: 'consistent with', zh: '与…一致' }, { en: 'a consistent result', zh: '一致的结果' }],
          contrast: { with: 'constant', diff: 'consistent 是「前后一致、稳定」；constant 是「一直不停」。consistent effort 是稳定努力，constant noise 是不停的噪音。' },
          register: '学术高频',
          why: 'consistent findings 是学术写作的固定说法，表示「这个结论很可靠」。'
        },
        {
          id: 'participant',
          word: 'participant',
          forms: ['participant', 'participants'],
          pos: 'n.',
          ipa: '/pɑːˈtɪsɪpənt/',
          zh: '参与者；（实验）被试',
          sense: '指参加实验的人。',
          sent: 'In a well-known experiment, participants who slept after studying a list of words recalled significantly more of them than those who stayed awake for the same period.',
          morph: [{ p: 'parti', g: '部分' }, { p: 'cip', g: '拿' }, { p: '-ant', g: '人' }],
          note: '同根词：participate 参加、participate in。',
          colloc: [{ en: 'study participants', zh: '研究参与者' }, { en: 'a willing participant', zh: '自愿参与者' }],
          contrast: { with: 'player', diff: 'participant 用于研究、活动、课程；player 用于游戏、比赛、乐器。' },
          register: '学术',
          why: '论文里几乎不用 people，一律用 participants。'
        },
        {
          id: 'recall',
          word: 'recall',
          forms: ['recall', 'recalled', 'recalls'],
          pos: 'v.',
          ipa: '/rɪˈkɔːl/',
          zh: '回忆起；使想起',
          sense: '指测试时能想起多少个单词。',
          sent: 'In a well-known experiment, participants who slept after studying a list of words recalled significantly more of them than those who stayed awake for the same period.',
          morph: [{ p: 're-', g: '回来' }, { p: 'call', g: '叫' }],
          note: '名词义还很常见：product recall 产品召回；beyond recall 无法挽回。',
          colloc: [{ en: 'recall a detail', zh: '想起一个细节' }, { en: 'total recall', zh: '完全的记忆力' }],
          contrast: { with: 'remember', diff: '意思接近，但 recall 更正式、更强调「主动把信息调取出来」，学术写作多用 recall。' },
          register: '学术 / 正式',
          why: '实验语境下 recall 比 remember 精确：它测的是「能不能提取出来」。'
        },
        {
          id: 'significantly',
          word: 'significantly',
          forms: ['significantly'],
          pos: 'adv.',
          ipa: '/sɪɡˈnɪfɪkəntli/',
          zh: '显著地；明显地',
          sense: '统计学意义上的「明显」，不是「稍微」。',
          sent: 'In a well-known experiment, participants who slept after studying a list of words recalled significantly more of them than those who stayed awake for the same period.',
          morph: [{ p: 'sign', g: '标记' }, { p: '-ific', g: '使…' }, { p: '-ant', g: '…的' }, { p: '-ly', g: '副词后缀' }],
          note: '学术写作里 significantly 默认带统计学含义：差异不是偶然。',
          colloc: [{ en: 'significantly higher', zh: '显著更高' }, { en: 'significantly improve', zh: '显著改善' }],
          contrast: { with: 'greatly', diff: 'significantly 在学术语境里带统计含义（有显著性差异）；greatly 只是「很、大大地」，没有统计含义。' },
          register: '学术高频',
          why: '雅思写作和阅读的高频副词，用对了立刻显得专业。'
        },
        {
          id: 'prioritise',
          word: 'prioritise',
          forms: ['prioritise', 'prioritises', 'prioritised', 'prioritize', 'prioritizes', 'prioritized'],
          pos: 'v.',
          ipa: '/praɪˈɒrətaɪz/',
          zh: '优先处理；把…排在前面',
          sense: '指大脑优先保存它认为重要的信息。',
          sent: 'The effect was strongest for material that participants had expected to be tested on, which suggests that the brain prioritises information it judges to be important.',
          morph: [{ p: 'prior', g: '在前的' }, { p: '-ity', g: '名词后缀' }, { p: '-ise', g: '动词后缀' }],
          note: '英式 -ise，美式 -ize，两种都对；考试里保持全文统一即可。',
          colloc: [{ en: 'prioritise tasks', zh: '给任务排优先级' }, { en: 'prioritise A over B', zh: '优先 A 而非 B' }],
          contrast: { with: 'focus on', diff: 'focus on 是「把注意力放在」；prioritise 是「排出先后顺序」，暗示资源有限、必须取舍。' },
          register: '职场 / 学术高频',
          why: '这个词把「大脑在分配有限资源」这层意思说出来了。'
        },
        {
          id: 'deprive',
          word: 'deprive',
          forms: ['deprive', 'deprived', 'deprives'],
          pos: 'v.',
          ipa: '/dɪˈpraɪv/',
          zh: '剥夺；使丧失',
          sense: 'be deprived of sleep = 被剥夺睡眠，即睡眠不足。',
          sent: 'People who are deprived of sleep tend to overreact to minor frustrations.',
          morph: [{ p: 'de-', g: '去掉' }, { p: 'priv', g: '个人、拿走' }],
          note: '固定搭配 deprive sb of sth，介词必须是 of，不能换成 from。',
          colloc: [{ en: 'be deprived of sth', zh: '被剥夺某物' }, { en: 'sleep-deprived', zh: '睡眠不足的' }],
          contrast: { with: 'lose', diff: 'lose 是「自己失去」；deprive 是「被别人拿走」，所以常见于被动语态。' },
          register: '中性偏正式',
          why: 'sleep-deprived 这个复合形容词在新闻里极常见，一次记两个。'
        },
        {
          id: 'substitute',
          word: 'substitute',
          forms: ['substitute', 'substitutes'],
          pos: 'n. / v.',
          ipa: '/ˈsʌbstɪtjuːt/',
          zh: '替代品；替代',
          sense: '指睡眠不能「代替」努力。',
          sent: 'None of this means that sleep is a substitute for effort.',
          morph: [{ p: 'sub-', g: '在下、代替' }, { p: 'stitut', g: '放置' }],
          note: '介词是 for，不是 of：a substitute for sth。作动词时 substitute A for B = 用 A 代替 B。',
          colloc: [{ en: 'a substitute for sth', zh: '某物的替代品' }, { en: 'substitute A for B', zh: '用 A 代替 B' }],
          contrast: { with: 'replacement', diff: 'replacement 更强调「换掉旧的」；substitute 强调「临时顶替」。substitute teacher 是代课老师。' },
          register: '中性偏正式',
          why: '学术写作里 substitute for 是很稳的搭配，注意别写成 of。'
        },
        {
          id: 'implication',
          word: 'implication',
          forms: ['implication', 'implications'],
          pos: 'n.',
          ipa: '/ˌɪmplɪˈkeɪʃn/',
          zh: '含义；影响；推论',
          sense: '指这个结论「意味着什么、会带来什么后果」。',
          sent: 'The practical implication is simple, if inconvenient: the hours before midnight are not more valuable than the hours after it.',
          morph: [{ p: 'im-', g: '向内' }, { p: 'plic', g: '折叠' }, { p: '-ation', g: '名词后缀' }],
          note: '同根词：complicate 使复杂、explicit 明确的（反义 implicit 隐含的）。',
          colloc: [{ en: 'the implications of sth', zh: '某事的影响' }, { en: 'have implications for', zh: '对…有影响' }],
          contrast: { with: 'meaning', diff: 'meaning 是「字面意思」；implication 是「没说出口、但能推出来的意思或后果」。' },
          register: '学术高频',
          why: '论文和雅思大作文都爱用它，从「事实」过渡到「所以呢」。'
        }
      ],
      grammar: [
        {
          point: 'which 引导非限制性定语从句（指代整句）',
          sent: 'The effect was strongest for material that participants had expected to be tested on, which suggests that the brain prioritises information it judges to be important.',
          explain: 'which 前面有逗号，它指代的是前面一整句话（「这种效应在预期会被考的材料上最强」），不是某个名词。后面 information it judges 里，it judges 前又省略了一个 that / which。一句里套了两层定语从句。',
          drills: [
            'He arrived late, which annoyed everyone. 他迟到了，这让所有人都不高兴。',
            'The study was small, which limits its value. 这项研究样本很小，这限制了它的价值。',
            'She said nothing, which I took as agreement. 她什么都没说，我把这当成同意。'
          ]
        },
        {
          point: '插入语 in effect + 比喻',
          sent: 'Students who cut sleep in order to study more are, in effect, borrowing time at a very high rate of interest.',
          explain: 'who cut sleep 修饰 students；in effect（实际上）用逗号隔开，插在 are 和 borrowing 中间，不影响句子主干：Students are borrowing time。borrow time at a high rate of interest 是比喻 —— 把熬夜当成借高利贷。',
          drills: [
            'People who skip breakfast, in effect, train their bodies to store fat. 不吃早饭的人，实际上是在训练身体储存脂肪。',
            'Companies that ignore feedback are, in effect, choosing to fail slowly. 忽视反馈的公司，实际上是在选择慢慢失败。',
            'She was, in effect, paying twice for the same mistake. 她实际上为同一个错误付了两次钱。'
          ]
        }
      ],
      shadow: [
        "During sleep, the brain is remarkably active, replaying the day's experiences, strengthening important memories and discarding what it considers irrelevant.",
        'Sleep also appears to play a role in emotional regulation.',
        'Students who cut sleep in order to study more are, in effect, borrowing time at a very high rate of interest.'
      ],
      writing: {
        prompt: '用 deprive、substitute、implication 写 3 句话，说说你对「熬夜备考」的看法。',
        hint: '先描述现象，再指出错误做法，最后写后果。',
        mustUse: ['deprive', 'substitute', 'implication'],
        model: 'Many students deprive themselves of sleep before an exam, believing that more hours must mean better results. They treat coffee as a substitute for rest, but attention does not work that way. The implication is uncomfortable: one extra hour of study may cost two hours of clear thinking the next morning.'
      }
    }
  ]
};
