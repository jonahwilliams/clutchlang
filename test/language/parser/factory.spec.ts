// tslint:disable:no-magic-numbers

import { TokenKind } from '../../../src/language/lexer';
import {
  AstNodeFactory,
  Operator,
  PrintTreeVisitor,
} from '../../../src/language/parser';

describe('AstNodeFactory', () => {
  const factory = new AstNodeFactory();
  const visitor = new PrintTreeVisitor();

  const a = factory.createSimpleName({
    comments: [],
    kind: TokenKind.IDENTIFIER,
    lexeme: 'a',
    offset: 0,
  });

  const b = factory.createSimpleName({
    comments: [],
    kind: TokenKind.IDENTIFIER,
    lexeme: 'b',
    offset: 0,
  });

  it('should create a file root', () => {
    const $arrow = {
      comments: [],
      kind: TokenKind.ARROW,
      lexeme: '->',
      offset: 0,
    };
    const $function = factory.createFunctionDeclaration(a, [], $arrow, b);
    const fileRoot = factory.createFileRoot([$function]);
    expect(fileRoot.firstToken).toEqual($function.firstToken);
    expect(fileRoot.lastToken).toEqual($function.lastToken);
    expect(fileRoot.topLevelElements).toEqual([$function]);
    expect(fileRoot.accept(visitor)).toMatchSnapshot();
  });

  it('should create a function', () => {
    const $arrow = {
      comments: [],
      kind: TokenKind.ARROW,
      lexeme: '->',
      offset: 0,
    };
    const $function = factory.createFunctionDeclaration(a, [b], $arrow, b);
    expect($function.arrowToken).toEqual($arrow);
    expect($function.body).toEqual(b);
    expect($function.firstToken).toEqual(a.firstToken);
    expect($function.lastToken).toEqual(b.lastToken);
    expect($function.name).toEqual(a);
    expect($function.parameters).toEqual([b]);
    expect($function.accept(visitor)).toMatchSnapshot();
  });

  describe('<Expression>', () => {
    it('should create BinaryExpression', () => {
      const $plus = {
        comments: [],
        kind: TokenKind.PLUS,
        lexeme: '+',
        offset: 0,
      };
      const expr = factory.createBinaryExpression(a, Operator.Add, $plus, b);
      expect(expr.firstToken).toBe(a.firstToken);
      expect(expr.lastToken).toBe(b.lastToken);
      expect(expr.left).toBe(a);
      expect(expr.operator).toBe(Operator.Add);
      expect(expr.right).toBe(b);
      expect(expr.target).toBe(a);
      expect(expr.accept(visitor)).toMatchSnapshot();
    });

    it('should create prefix UnaryExpression', () => {
      const $negate = {
        comments: [],
        kind: TokenKind.NEGATE,
        lexeme: '!',
        offset: 0,
      };
      const expr = factory.createUnaryExpression(
        a,
        Operator.UnaryNegative,
        $negate,
        true
      );
      expect(expr.firstToken).toBe($negate);
      expect(expr.lastToken).toBe(a.lastToken);
      expect(expr.operator).toEqual(Operator.UnaryNegation);
      expect(expr.target).toBe(a);
      expect(expr.accept(visitor)).toMatchSnapshot();
    });

    it('should create postfix UnaryExpression', () => {
      const $accessor = {
        comments: [],
        kind: TokenKind.PERIOD,
        lexeme: '!',
        offset: 0,
      };
      const expr = factory.createUnaryExpression(
        a,
        Operator.Accessor,
        $accessor,
        false
      );
      expect(expr.firstToken).toBe(a.firstToken);
      expect(expr.lastToken).toBe($accessor);
      expect(expr.operator).toEqual(Operator.Accessor);
      expect(expr.target).toBe(a);
      expect(expr.accept(visitor)).toMatchSnapshot();
    });

    it('should create GroupExpression', () => {
      const $lp = {
        comments: [],
        kind: TokenKind.LEFT_PAREN,
        lexeme: '(',
        offset: 0,
      };
      const $rp = {
        comments: [],
        kind: TokenKind.RIGHT_SHIFT,
        lexeme: ')',
        offset: 0,
      };
      const expr = factory.createGroupExpression($lp, $rp, a);
      expect(expr.expression).toEqual(a);
      expect(expr.firstToken).toEqual($lp);
      expect(expr.lastToken).toEqual($rp);
      expect(expr.accept(visitor)).toMatchSnapshot();
    });

    describe('should create IfExpression', () => {
      const $if = {
        comments: [],
        kind: TokenKind.IF,
        lexeme: 'if',
        offset: 0,
      };

      it('', () => {
        const expr = factory.createIfExpression($if, a, b);
        expect(expr.body).toEqual(b);
        expect(expr.condition).toEqual(a);
        expect(expr.elseBody).toBeUndefined();
        expect(expr.elseToken).toBeUndefined();
        expect(expr.firstToken).toEqual($if);
        expect(expr.ifToken).toBe($if);
        expect(expr.lastToken).toBe(b.lastToken);
        expect(expr.accept(visitor)).toMatchSnapshot();
      });

      it('with else', () => {
        const $else = {
          comments: [],
          kind: TokenKind.ELSE,
          lexeme: 'else',
          offset: 0,
        };
        const expr = factory.createIfExpression($if, a, b, $else, a);
        expect(expr.body).toEqual(b);
        expect(expr.condition).toEqual(a);
        expect(expr.elseBody).toEqual(a);
        expect(expr.elseToken).toEqual($else);
        expect(expr.firstToken).toEqual($if);
        expect(expr.ifToken).toBe($if);
        expect(expr.lastToken).toBe(a.lastToken);
        expect(expr.accept(visitor)).toMatchSnapshot();
      });
    });
  });

  describe('Statement', () => {
    it('should create a block', () => {
      const $lc = {
        comments: [],
        kind: TokenKind.LEFT_CURLY,
        lexeme: '{',
        offset: 0,
      };
      const $rc = {
        comments: [],
        kind: TokenKind.RIGHT_CURLY,
        lexeme: '}',
        offset: 0,
      };
      const stmt = factory.createStatementBlock($lc, [], $rc);
      expect(stmt.firstToken).toEqual($lc);
      expect(stmt.statements).toEqual([]);
      expect(stmt.lastToken).toEqual($rc);
    });

    it('should create a return statement', () => {
      const $return = {
        comments: [],
        kind: TokenKind.RETURN,
        lexeme: 'return',
        offset: 0,
      };
      const stmt = factory.createJumpStatement($return, a);
      expect(stmt.expression).toEqual(a);
      expect(stmt.firstToken).toEqual($return);
      expect(stmt.lastToken).toEqual(a.lastToken);
      expect(stmt.accept(visitor)).toMatchSnapshot();
    });

    it('should create a let statement', () => {
      const $let = {
        comments: [],
        kind: TokenKind.LET,
        lexeme: 'let',
        offset: 0,
      };
      const $eq = {
        comments: [],
        kind: TokenKind.ASSIGN,
        lexeme: '=',
        offset: 0,
      };
      const stmt = factory.createVariableStatement($let, a, $eq, b);
      expect(stmt.assignToken).toEqual($eq);
      expect(stmt.expression).toEqual(b);
      expect(stmt.firstToken).toEqual($let);
      expect(stmt.lastToken).toEqual(b.lastToken);
      expect(stmt.name).toEqual(a);
      expect(stmt.accept(visitor)).toMatchSnapshot();
    });
  });

  it('should create an invoke expression', () => {
    const $open = {
      comments: [],
      kind: TokenKind.LEFT_PAREN,
      lexeme: '(',
      offset: 0,
    };
    const $close = {
      comments: [],
      kind: TokenKind.RIGHT_PAREN,
      lexeme: '(',
      offset: 0,
    };
    const expr = factory.createInvokeExpression(a, $open, [], $close);
    expect(expr.closeToken).toEqual($close);
    expect(expr.firstToken).toEqual(a.firstToken);
    expect(expr.lastToken).toEqual($close);
    expect(expr.openToken).toEqual($open);
    expect(expr.parameters).toEqual([]);
    expect(expr.target).toEqual(a);
    expect(expr.accept(visitor)).toMatchSnapshot();
  });

  describe('LiteralBoolean', () => {
    it('should evaluate true', () => {
      const token = {
        comments: [],
        kind: TokenKind.TRUE,
        lexeme: 'true',
        offset: 0,
      };
      const $true = factory.createLiteralBoolean(token);
      expect($true.firstToken).toBe(token);
      expect($true.lastToken).toBe(token);
      expect($true.value).toBe(true);
      expect($true.accept(visitor)).toMatchSnapshot();
    });

    it('should evaluate false', () => {
      const token = {
        comments: [],
        kind: TokenKind.TRUE,
        lexeme: 'false',
        offset: 0,
      };
      const $false = factory.createLiteralBoolean(token);
      expect($false.firstToken).toBe(token);
      expect($false.lastToken).toBe(token);
      expect($false.value).toBe(false);
      expect($false.accept(visitor)).toMatchSnapshot();
    });
  });

  describe('LiteralNumber', () => {
    it('should evaluate int', () => {
      const token = {
        comments: [],
        kind: TokenKind.NUMBER,
        lexeme: '1',
        offset: 0,
      };
      const $1 = factory.createLiteralNumber(token);
      expect($1.firstToken).toBe(token);
      expect($1.lastToken).toBe(token);
      expect($1.value).toBe(1);
      expect($1.accept(visitor)).toMatchSnapshot();
    });

    it('should evaluate float', () => {
      const token = {
        comments: [],
        kind: TokenKind.NUMBER,
        lexeme: '1.5',
        offset: 0,
      };
      const $1 = factory.createLiteralNumber(token);
      expect($1.firstToken).toBe(token);
      expect($1.lastToken).toBe(token);
      expect($1.value).toBe(1.5);
      expect($1.accept(visitor)).toMatchSnapshot();
    });

    it('should evaluate hex', () => {
      const token = {
        comments: [],
        kind: TokenKind.NUMBER,
        lexeme: '0xFFF',
        offset: 0,
      };
      const $0xFFF = factory.createLiteralNumber(token);
      expect($0xFFF.firstToken).toBe(token);
      expect($0xFFF.lastToken).toBe(token);
      expect($0xFFF.value).toBe(0xfff);
      expect($0xFFF.accept(visitor)).toMatchSnapshot();
    });

    it('should evaluate exponential', () => {
      const token = {
        comments: [],
        kind: TokenKind.NUMBER,
        lexeme: '2e6',
        offset: 0,
      };
      const $2e6 = factory.createLiteralNumber(token);
      expect($2e6.firstToken).toBe(token);
      expect($2e6.lastToken).toBe(token);
      expect($2e6.value).toBe(2e6);
      expect($2e6.accept(visitor)).toMatchSnapshot();
    });
  });

  describe('LiteralString', () => {
    it('should evaluate an empty string', () => {
      const token = {
        comments: [],
        kind: TokenKind.STRING,
        lexeme: '',
        offset: 0,
      };
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('');
      expect(empty.accept(visitor)).toMatchSnapshot();
    });

    it('should evaluate a single-line string', () => {
      const token = {
        comments: [],
        kind: TokenKind.STRING,
        lexeme: 'Hello',
        offset: 0,
      };
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('Hello');
    });

    it('should evaluate a single-line string with escaped newlines', () => {
      const token = {
        comments: [],
        kind: TokenKind.STRING,
        lexeme: String.raw`Hello\nWorld`,
        offset: 0,
      };
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('Hello\nWorld');
    });

    it('should evaluate a multi-line string', () => {
      const token = {
        comments: [],
        kind: TokenKind.STRING,
        lexeme: `
        <html>
          <body></body>
        </html>
      `,
        offset: 0,
      };
      const empty = factory.createLiteralString(token);
      expect(empty.firstToken).toBe(token);
      expect(empty.lastToken).toBe(token);
      expect(empty.value).toBe('<html>\n  <body></body>\n</html>\n');
    });
  });

  it('SimpleName should implement AstNode', () => {
    const token = {
      comments: [],
      kind: TokenKind.IDENTIFIER,
      lexeme: 'fooBar',
      offset: 0,
    };
    const fooBar = factory.createSimpleName(token);
    expect(fooBar.firstToken).toBe(token);
    expect(fooBar.lastToken).toBe(token);
    expect(fooBar.name).toBe('fooBar');
    expect(fooBar.accept(visitor)).toMatchSnapshot();
  });
});
