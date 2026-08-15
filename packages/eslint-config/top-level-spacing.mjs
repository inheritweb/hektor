const blankLinesBetweenDeclarations = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require blank lines between top-level declarations',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missing: 'Add a blank line between top-level declarations.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program(node) {
        for (let index = 1; index < node.body.length; index += 1) {
          const previous = node.body[index - 1];
          const current = node.body[index];

          if (
            previous.type === 'ImportDeclaration' &&
            current.type === 'ImportDeclaration'
          ) {
            continue;
          }

          const between = sourceCode.text.slice(
            previous.range[1],
            current.range[0],
          );

          if (!between.includes('\n\n')) {
            context.report({
              node: current,
              messageId: 'missing',
              fix(fixer) {
                return fixer.insertTextAfter(previous, '\n');
              },
            });
          }
        }
      },
    };
  },
};

export const topLevelSpacingPlugin = {
  rules: {
    'blank-lines-between-declarations': blankLinesBetweenDeclarations,
  },
};

export const topLevelSpacingConfig = {
  plugins: {
    hektor: topLevelSpacingPlugin,
  },
  rules: {
    'hektor/blank-lines-between-declarations': 'error',
  },
};
