---
layout: post
title: "Writing a Simple Compiler: Lexer to Assembly"
date: 2025-08-13
categories: [Compilers, Low-Level]
tags: [Compilers, Lexer, Parser, Assembly, C]
---

Compilers seem like magic, but they're just programs that transform text. Let's build a tiny compiler that turns simple math expressions into x86 assembly.

## The Pipeline

```
Source Code → Lexer → Parser → Code Generator → Assembly
"2 + 3 * 4"   Tokens   AST      Instructions     "mov eax, 14"
```

## Step 1: Lexer (Tokenization)

```c
typedef enum {
    TOKEN_NUMBER,
    TOKEN_PLUS,
    TOKEN_MINUS,
    TOKEN_STAR,
    TOKEN_SLASH,
    TOKEN_EOF
} TokenType;

typedef struct {
    TokenType type;
    int value;  // For TOKEN_NUMBER
} Token;

Token next_token(const char** input) {
    while (**input == ' ') (*input)++;  // Skip whitespace
    
    if (isdigit(**input)) {
        Token tok = {TOKEN_NUMBER, 0};
        while (isdigit(**input)) {
            tok.value = tok.value * 10 + (**input - '0');
            (*input)++;
        }
        return tok;
    }
    
    switch (**input) {
        case '+': (*input)++; return (Token){TOKEN_PLUS, 0};
        case '-': (*input)++; return (Token){TOKEN_MINUS, 0};
        case '*': (*input)++; return (Token){TOKEN_STAR, 0};
        case '/': (*input)++; return (Token){TOKEN_SLASH, 0};
        case '\0': return (Token){TOKEN_EOF, 0};
        default: fprintf(stderr, "Unknown character\n"); exit(1);
    }
}
```

## Step 2: Parser (Build AST)

```c
typedef enum { AST_NUMBER, AST_BINOP } ASTType;

typedef struct AST {
    ASTType type;
    union {
        int number;
        struct {
            TokenType op;
            struct AST *left, *right;
        } binop;
    };
} AST;

// Recursive descent parser
AST* parse_expression();
AST* parse_term();
AST* parse_factor();

AST* parse_factor() {
    Token tok = next_token(&input);
    if (tok.type == TOKEN_NUMBER) {
        AST* node = malloc(sizeof(AST));
        node->type = AST_NUMBER;
        node->number = tok.value;
        return node;
    }
    error("Expected number");
}

AST* parse_term() {
    AST* left = parse_factor();
    
    while (peek() == TOKEN_STAR || peek() == TOKEN_SLASH) {
        Token op = next_token(&input);
        AST* right = parse_factor();
        
        AST* node = malloc(sizeof(AST));
        node->type = AST_BINOP;
        node->binop.op = op.type;
        node->binop.left = left;
        node->binop.right = right;
        left = node;
    }
    
    return left;
}

AST* parse_expression() {
    AST* left = parse_term();
    
    while (peek() == TOKEN_PLUS || peek() == TOKEN_MINUS) {
        Token op = next_token(&input);
        AST* right = parse_term();
        
        AST* node = malloc(sizeof(AST));
        node->type = AST_BINOP;
        node->binop.op = op.type;
        node->binop.left = left;
        node->binop.right = right;
        left = node;
    }
    
    return left;
}
```

## Step 3: Code Generation

```c
void generate(AST* node) {
    if (node->type == AST_NUMBER) {
        printf("  mov rax, %d\n", node->number);
        return;
    }
    
    // Generate left subtree
    generate(node->binop.left);
    printf("  push rax\n");  // Save result
    
    // Generate right subtree
    generate(node->binop.right);
    printf("  pop rbx\n");   // Restore left result
    
    // Perform operation
    switch (node->binop.op) {
        case TOKEN_PLUS:
            printf("  add rax, rbx\n");
            break;
        case TOKEN_MINUS:
            printf("  sub rbx, rax\n");
            printf("  mov rax, rbx\n");
            break;
        case TOKEN_STAR:
            printf("  imul rax, rbx\n");
            break;
        case TOKEN_SLASH:
            printf("  mov rdx, 0\n");
            printf("  mov rcx, rax\n");
            printf("  mov rax, rbx\n");
            printf("  idiv rcx\n");
            break;
    }
}
```

## Complete Example

**Input:** `2 + 3 * 4`

**Generated Assembly:**
```asm
  mov rax, 2
  push rax
  mov rax, 3
  push rax
  mov rax, 4
  pop rbx
  imul rax, rbx
  pop rbx
  add rax, rbx
```

**Result:** `rax = 14`

## Testing

```c
int main() {
    const char* input = "2 + 3 * 4";
    AST* ast = parse_expression();
    
    printf(".global _start\n");
    printf("_start:\n");
    generate(ast);
    printf("  mov rdi, rax\n");
    printf("  mov rax, 60\n");  // exit syscall
    printf("  syscall\n");
    
    return 0;
}
```

**Compile and run:**
```bash
./compiler > output.s
as output.s -o output.o
ld output.o -o output
./output
echo $?  # Prints 14
```

## Conclusion

We built a compiler in ~200 lines of C that:
- Tokenizes input
- Parses expressions with correct precedence
- Generates x86-64 assembly

**Next Steps:**
- Add variables and assignment
- Implement control flow (if/while)
- Add functions and stack frames

---

*Have you written a compiler? What language did you target?*
