const OPTION_CLASSES = [];

const BLOCK_LEVEL = /^(H[1-6]|P|DIV)$/;

/**
 * Collects the inline content of a question for use inside <summary>.
 * Headings / paragraphs are unwrapped (no headings inside <summary>); their
 * inline children (text, links, emphasis) are kept.
 * @param {Node[]} nodes
 * @returns {Node[]}
 */
function inlineContent(nodes) {
  const out = [];
  nodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n.textContent.trim()) out.push(document.createTextNode(n.textContent.trim()));
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE || !n.textContent.trim()) return;
    if (BLOCK_LEVEL.test(n.tagName)) {
      if (out.length) out.push(document.createTextNode(' '));
      out.push(...inlineContent([...n.childNodes]));
    } else {
      out.push(n);
    }
  });
  return out;
}

/**
 * Splits a row into question and answer nodes.
 * Usual shape: question cell | answer cell. A single-cell row is split at
 * its first heading/paragraph (question) and the rest (answer).
 */
function splitRow(row) {
  const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('img'));
  if (cells.length >= 2) {
    const [question, ...answers] = cells;
    return {
      question: [...question.childNodes],
      answer: answers.flatMap((c) => [...c.childNodes]),
    };
  }
  if (cells.length === 1) {
    const nodes = [...cells[0].childNodes].filter((n) => n.nodeType === Node.ELEMENT_NODE
      || n.textContent.trim());
    const first = nodes.find((n) => n.nodeType === Node.ELEMENT_NODE);
    if (!first || nodes.length === 1) return { question: nodes, answer: [] };
    return { question: [first], answer: nodes.filter((n) => n !== first) };
  }
  return { question: [], answer: [] };
}

/**
 * Accordion (FAQ): a list of questions that expand to reveal their answers,
 * built on native <details>/<summary> (keyboard and screen-reader support
 * come from the platform; content stays findable with in-page search).
 * One authored row per item: question | answer (inline links kept).
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const items = [];
  [...block.children].forEach((row) => {
    const { question, answer } = splitRow(row);
    const label = inlineContent(question);
    if (!label.length) return;

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-question';
    const text = document.createElement('span');
    text.className = 'accordion-faq-question-text';
    text.append(...label);
    summary.append(text);
    details.append(summary);

    const body = document.createElement('div');
    body.className = 'accordion-faq-answer';
    answer.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) return;
      body.append(n);
    });
    if (body.childNodes.length) details.append(body);
    else details.classList.add('accordion-faq-item-empty');
    items.push(details);
  });

  block.replaceChildren(...items);
}
