// Lean4 Elaborator - Type inference and elaboration

import * as AST from '../parser/ast';
import {
  Type, TypeVar, TypeConst, TypeApp, PiType, MetaVar,
  Context, Env, Value, VLam, VNeutral, VSort, VConstr,
  emptyContext, extendContext, typeVar, typeConst, typeApp,
  piType, univType, sortType, propType, metaVar,
  vNeutral, nVar, formatType
} from '../types';

export class ElabError extends Error {
  constructor(message: string, public loc?: AST.SourceLocation) {
    super(`Elaboration error: ${message}`);
    this.name = 'ElabError';
  }
}

// Metavariable state
let metaIdCounter = 0;

function freshMeta(name?: string): MetaVar {
  return metaVar(metaIdCounter++, name);
}

// Substitution
export type Subst = Map<string, Type>;

export function applySubst(subst: Subst, type: Type): Type {
  switch (type.kind) {
    case 'typeVar':
      const t = subst.get(type.name);
      return t ? applySubst(subst, t) : type;

    case 'typeConst':
      return type;

    case 'typeApp':
      return typeApp(applySubst(subst, type.fn), applySubst(subst, type.arg));

    case 'piType':
      return piType(
        type.name,
        applySubst(subst, type.domain),
        applySubst(subst, type.codomain),
        type.implicit
      );

    case 'sigmaType':
      return {
        kind: 'sigmaType',
        name: type.name,
        fst: applySubst(subst, type.fst),
        snd: applySubst(subst, type.snd)
      };

    case 'univType':
    case 'sortType':
    case 'propType':
      return type;

    case 'metaVar':
      if (type.value) {
        return applySubst(subst, type.value);
      }
      return type;
  }
}

// Unification
export function unify(t1: Type, t2: Type, subst: Subst): Subst {
  t1 = applySubst(subst, t1);
  t2 = applySubst(subst, t2);

  if (t1.kind === 'metaVar' && t2.kind === 'metaVar' && t1.id === t2.id) {
    return subst;
  }

  if (t1.kind === 'metaVar') {
    return solveMeta(t1, t2, subst);
  }

  if (t2.kind === 'metaVar') {
    return solveMeta(t2, t1, subst);
  }

  if (t1.kind === 'typeVar' && t2.kind === 'typeVar' && t1.name === t2.name) {
    return subst;
  }

  if (t1.kind === 'typeConst' && t2.kind === 'typeConst' && t1.name === t2.name) {
    return subst;
  }

  if (t1.kind === 'typeApp' && t2.kind === 'typeApp') {
    subst = unify(t1.fn, t2.fn, subst);
    return unify(t1.arg, t2.arg, subst);
  }

  if (t1.kind === 'piType' && t2.kind === 'piType') {
    subst = unify(t1.domain, t2.domain, subst);
    const cod1 = substituteTypeVar(t1.codomain, t1.name, typeVar(t2.name));
    return unify(cod1, t2.codomain, subst);
  }

  if (t1.kind === 'univType' && t2.kind === 'univType') {
    return subst;
  }

  if (t1.kind === 'sortType' && t2.kind === 'sortType' && t1.level === t2.level) {
    return subst;
  }

  if (t1.kind === 'propType' && t2.kind === 'propType') {
    return subst;
  }

  throw new ElabError(`Cannot unify ${formatType(t1)} with ${formatType(t2)}`);
}

function solveMeta(meta: MetaVar, type: Type, subst: Subst): Subst {
  if (occurs(meta.id, type)) {
    throw new ElabError(`Occurs check failed: ?${meta.id} in ${formatType(type)}`);
  }

  const newSubst = new Map(subst);
  newSubst.set(`?${meta.id}`, type);

  if (meta.value === undefined) {
    meta.value = type;
  }

  return newSubst;
}

function occurs(metaId: number, type: Type): boolean {
  switch (type.kind) {
    case 'metaVar':
      return type.id === metaId || (type.value !== undefined && occurs(metaId, type.value));
    case 'typeVar':
    case 'typeConst':
    case 'univType':
    case 'sortType':
    case 'propType':
      return false;
    case 'typeApp':
      return occurs(metaId, type.fn) || occurs(metaId, type.arg);
    case 'piType':
      return occurs(metaId, type.domain) || occurs(metaId, type.codomain);
    case 'sigmaType':
      return occurs(metaId, type.fst) || occurs(metaId, type.snd);
  }
}

function substituteTypeVar(type: Type, name: string, replacement: Type): Type {
  switch (type.kind) {
    case 'typeVar':
      return type.name === name ? replacement : type;
    case 'typeConst':
    case 'univType':
    case 'sortType':
    case 'propType':
      return type;
    case 'typeApp':
      return typeApp(
        substituteTypeVar(type.fn, name, replacement),
        substituteTypeVar(type.arg, name, replacement)
      );
    case 'piType':
      if (type.name === name) return type;
      return piType(
        type.name,
        substituteTypeVar(type.domain, name, replacement),
        substituteTypeVar(type.codomain, name, replacement),
        type.implicit
      );
    case 'sigmaType':
      if (type.name === name) return type;
      return {
        kind: 'sigmaType',
        name: type.name,
        fst: substituteTypeVar(type.fst, name, replacement),
        snd: substituteTypeVar(type.snd, name, replacement)
      };
    case 'metaVar':
      return type;
  }
}

// Type inference
export interface InferResult {
  type: Type;
  subst: Subst;
  elaborated: AST.Expr;
}

export function infer(ctx: Context, expr: AST.Expr, subst: Subst = new Map()): InferResult {
  switch (expr.kind) {
    case 'literal':
      return inferLiteral(expr, subst);

    case 'ident':
      return inferIdent(ctx, expr, subst);

    case 'hole':
      const meta = freshMeta(expr.name);
      return {
        type: meta,
        subst,
        elaborated: expr
      };

    case 'app':
      return inferApp(ctx, expr, subst);

    case 'lambda':
    case 'fun':
      return inferLambda(ctx, expr, subst);

    case 'pi':
    case 'forall':
      return inferPi(ctx, expr, subst);

    case 'let':
      return inferLet(ctx, expr, subst);

    case 'if':
      return inferIf(ctx, expr, subst);

    case 'match':
      return inferMatch(ctx, expr, subst);

    case 'type':
      return {
        type: sortType((expr.level || 0) + 1),
        subst,
        elaborated: expr
      };

    case 'sort':
      return {
        type: sortType(expr.level + 1),
        subst,
        elaborated: expr
      };

    case 'prop':
      return {
        type: sortType(1),
        subst,
        elaborated: expr
      };

    case 'binOp':
      return inferBinOp(ctx, expr, subst);

    case 'unaryOp':
      return inferUnaryOp(ctx, expr, subst);

    case 'paren':
      return infer(ctx, expr.expr, subst);

    case 'arrayLit':
      return inferArrayLit(ctx, expr, subst);

    case 'fieldAccess':
      return inferFieldAccess(ctx, expr, subst);

    case 'proj':
      return inferProj(ctx, expr, subst);

    case 'have':
    case 'show':
      return infer(ctx, expr.proof, subst);

    case 'do':
      return inferDo(ctx, expr, subst);

    case 'exists':
      return inferExists(ctx, expr, subst);

    default:
      throw new ElabError(`Cannot infer type for: ${(expr as any).kind}`);
  }
}

function inferLiteral(expr: AST.LiteralExpr, subst: Subst): InferResult {
  let type: Type;
  switch (expr.type) {
    case 'nat':
      type = typeConst('Nat');
      break;
    case 'int':
      type = typeConst('Int');
      break;
    case 'float':
      type = typeConst('Float');
      break;
    case 'string':
      type = typeConst('String');
      break;
    case 'char':
      type = typeConst('Char');
      break;
    case 'bool':
      type = typeConst('Bool');
      break;
  }
  return { type, subst, elaborated: expr };
}

function inferIdent(ctx: Context, expr: AST.IdentExpr, subst: Subst): InferResult {
  const type = ctx.types.get(expr.name);
  if (type) {
    return { type, subst, elaborated: expr };
  }

  // Built-in identifiers
  switch (expr.name) {
    case 'Nat':
    case 'Int':
    case 'Float':
    case 'String':
    case 'Char':
    case 'Bool':
    case 'Unit':
    case 'Empty':
      return { type: sortType(0), subst, elaborated: expr };
    case 'Prop':
    case 'Type':
      return { type: sortType(1), subst, elaborated: expr };
    case 'true':
    case 'false':
      return { type: typeConst('Bool'), subst, elaborated: expr };
    case 'not':
      return {
        type: piType('_', typeConst('Bool'), typeConst('Bool'), false),
        subst,
        elaborated: expr
      };
    case 'and':
    case 'or':
      return {
        type: piType('_',
          piType('_', typeConst('Bool'), typeConst('Bool'), false),
          piType('_', typeConst('Bool'), typeConst('Bool'), false),
          false
        ),
        subst,
        elaborated: expr
      };
    default:
      // Return a metavariable for unknown identifiers
      const meta = freshMeta(expr.name);
      return { type: meta, subst, elaborated: expr };
  }
}

function inferApp(ctx: Context, expr: AST.AppExpr, subst: Subst): InferResult {
  const fnResult = infer(ctx, expr.fn, subst);
  subst = fnResult.subst;

  const argResult = infer(ctx, expr.arg, subst);
  subst = argResult.subst;

  const resultType = freshMeta();
  const expectedFnType = piType('_', argResult.type, resultType, false);

  try {
    subst = unify(fnResult.type, expectedFnType, subst);
  } catch (e) {
    // For now, just continue with the result type
  }

  return {
    type: applySubst(subst, resultType),
    subst,
    elaborated: {
      ...expr,
      fn: fnResult.elaborated,
      arg: argResult.elaborated
    }
  };
}

function inferLambda(ctx: Context, expr: AST.LambdaExpr | AST.FunExpr, subst: Subst): InferResult {
  if (expr.params.length === 0) {
    throw new ElabError('Lambda with no parameters');
  }

  let currentCtx = ctx;
  let paramTypes: Type[] = [];
  let elaboratedParams: AST.Binder[] = [];

  for (const param of expr.params) {
    let paramType: Type;
    if (param.type) {
      const typeResult = infer(ctx, param.type, subst);
      paramType = typeResult.type;
      subst = typeResult.subst;
    } else {
      paramType = freshMeta(param.name);
    }
    paramTypes.push(paramType);
    elaboratedParams.push({ ...param, type: typeToExpr(paramType) });
    currentCtx = extendContext(currentCtx, param.name, paramType);
  }

  const bodyResult = infer(currentCtx, expr.body, subst);
  subst = bodyResult.subst;

  let resultType: Type = bodyResult.type;
  for (let i = paramTypes.length - 1; i >= 0; i--) {
    resultType = piType(expr.params[i].name, paramTypes[i], resultType, expr.params[i].implicit);
  }

  return {
    type: applySubst(subst, resultType),
    subst,
    elaborated: {
      ...expr,
      params: elaboratedParams,
      body: bodyResult.elaborated
    }
  };
}

function inferPi(ctx: Context, expr: AST.PiExpr | AST.ForallExpr, subst: Subst): InferResult {
  let currentCtx = ctx;
  let paramTypes: Type[] = [];
  let elaboratedParams: AST.Binder[] = [];

  for (const param of expr.params) {
    let paramType: Type;
    if (param.type) {
      const typeResult = infer(ctx, param.type, subst);
      paramType = typeResult.type;
      subst = typeResult.subst;
    } else {
      paramType = freshMeta(param.name);
    }
    paramTypes.push(paramType);
    elaboratedParams.push({ ...param, type: typeToExpr(paramType) });
    currentCtx = extendContext(currentCtx, param.name, paramType);
  }

  const bodyResult = infer(currentCtx, expr.body, subst);
  subst = bodyResult.subst;

  return {
    type: sortType(0), // Simplified: Pi types return Prop/Type
    subst,
    elaborated: {
      ...expr,
      params: elaboratedParams,
      body: bodyResult.elaborated
    }
  };
}

function inferLet(ctx: Context, expr: AST.LetExpr, subst: Subst): InferResult {
  const valueResult = infer(ctx, expr.value, subst);
  subst = valueResult.subst;

  let declaredType: Type | undefined;
  if (expr.type) {
    const typeResult = infer(ctx, expr.type, subst);
    declaredType = typeResult.type;
    subst = typeResult.subst;
    try {
      subst = unify(declaredType, valueResult.type, subst);
    } catch (e) {
      // Continue anyway
    }
  }

  const valueType = declaredType || valueResult.type;

  if (expr.body) {
    const newCtx = extendContext(ctx, expr.name, valueType);
    const bodyResult = infer(newCtx, expr.body, subst);
    return {
      type: bodyResult.type,
      subst: bodyResult.subst,
      elaborated: {
        ...expr,
        value: valueResult.elaborated,
        type: typeToExpr(valueType),
        body: bodyResult.elaborated
      }
    };
  }

  return {
    type: valueType,
    subst,
    elaborated: {
      ...expr,
      value: valueResult.elaborated,
      type: typeToExpr(valueType)
    }
  };
}

function inferIf(ctx: Context, expr: AST.IfExpr, subst: Subst): InferResult {
  const condResult = infer(ctx, expr.cond, subst);
  subst = condResult.subst;

  try {
    subst = unify(condResult.type, typeConst('Bool'), subst);
  } catch (e) {
    // Continue anyway
  }

  const thenResult = infer(ctx, expr.thenBranch, subst);
  subst = thenResult.subst;

  if (expr.elseBranch) {
    const elseResult = infer(ctx, expr.elseBranch, subst);
    subst = elseResult.subst;

    try {
      subst = unify(thenResult.type, elseResult.type, subst);
    } catch (e) {
      // Continue anyway
    }

    return {
      type: applySubst(subst, thenResult.type),
      subst,
      elaborated: {
        ...expr,
        cond: condResult.elaborated,
        thenBranch: thenResult.elaborated,
        elseBranch: elseResult.elaborated
      }
    };
  }

  return {
    type: thenResult.type,
    subst,
    elaborated: {
      ...expr,
      cond: condResult.elaborated,
      thenBranch: thenResult.elaborated
    }
  };
}

function inferMatch(ctx: Context, expr: AST.MatchExpr, subst: Subst): InferResult {
  const scrutineeResult = infer(ctx, expr.scrutinee, subst);
  subst = scrutineeResult.subst;

  if (expr.cases.length === 0) {
    throw new ElabError('Match expression with no cases');
  }

  const resultType = freshMeta();
  let elaboratedCases: AST.MatchCase[] = [];

  for (const case_ of expr.cases) {
    const caseCtx = addPatternBindings(ctx, case_.pattern, scrutineeResult.type);
    const bodyResult = infer(caseCtx, case_.body, subst);
    subst = bodyResult.subst;

    try {
      subst = unify(resultType, bodyResult.type, subst);
    } catch (e) {
      // Continue anyway
    }

    elaboratedCases.push({
      ...case_,
      body: bodyResult.elaborated
    });
  }

  return {
    type: applySubst(subst, resultType),
    subst,
    elaborated: {
      ...expr,
      scrutinee: scrutineeResult.elaborated,
      cases: elaboratedCases
    }
  };
}

function addPatternBindings(ctx: Context, pattern: AST.Pattern, scrutineeType: Type): Context {
  switch (pattern.kind) {
    case 'wildcard':
      return ctx;

    case 'var':
      return extendContext(ctx, pattern.name, scrutineeType);

    case 'lit':
      return ctx;

    case 'ctor':
      // Simplified: assume constructor patterns bind their args
      let result = ctx;
      for (const arg of pattern.args) {
        result = addPatternBindings(result, arg, freshMeta());
      }
      return result;

    case 'tuple':
    case 'array':
      let tupleCtx = ctx;
      for (const elem of pattern.elements) {
        tupleCtx = addPatternBindings(tupleCtx, elem, freshMeta());
      }
      return tupleCtx;

    case 'as':
      return addPatternBindings(extendContext(ctx, pattern.name, scrutineeType), pattern.pattern, scrutineeType);

    default:
      return ctx;
  }
}

function inferBinOp(ctx: Context, expr: AST.BinOpExpr, subst: Subst): InferResult {
  const leftResult = infer(ctx, expr.left, subst);
  subst = leftResult.subst;

  const rightResult = infer(ctx, expr.right, subst);
  subst = rightResult.subst;

  let resultType: Type;

  switch (expr.op) {
    case 'add':
    case 'sub':
    case 'mul':
    case 'div':
    case 'mod':
    case 'pow':
      // Numeric operations - assume same type as operands
      try {
        subst = unify(leftResult.type, rightResult.type, subst);
      } catch (e) {
        // Continue
      }
      resultType = leftResult.type;
      break;

    case 'eq':
    case 'ne':
    case 'lt':
    case 'le':
    case 'gt':
    case 'ge':
      resultType = typeConst('Bool');
      break;

    case 'and':
    case 'or':
    case 'implies':
    case 'iff':
      resultType = typeConst('Bool');
      break;

    case 'cons':
    case 'append':
      resultType = leftResult.type;
      break;

    default:
      resultType = freshMeta();
  }

  return {
    type: applySubst(subst, resultType),
    subst,
    elaborated: {
      ...expr,
      left: leftResult.elaborated,
      right: rightResult.elaborated
    }
  };
}

function inferUnaryOp(ctx: Context, expr: AST.UnaryOpExpr, subst: Subst): InferResult {
  const operandResult = infer(ctx, expr.operand, subst);
  subst = operandResult.subst;

  let resultType: Type;

  switch (expr.op) {
    case 'not':
      resultType = typeConst('Bool');
      break;
    case 'neg':
      resultType = operandResult.type;
      break;
    default:
      resultType = freshMeta();
  }

  return {
    type: applySubst(subst, resultType),
    subst,
    elaborated: {
      ...expr,
      operand: operandResult.elaborated
    }
  };
}

function inferArrayLit(ctx: Context, expr: AST.ArrayLitExpr, subst: Subst): InferResult {
  if (expr.elements.length === 0) {
    return {
      type: typeApp(typeConst('Array'), freshMeta()),
      subst,
      elaborated: expr
    };
  }

  const elemType = freshMeta();
  let elaboratedElements: AST.Expr[] = [];

  for (const elem of expr.elements) {
    const result = infer(ctx, elem, subst);
    subst = result.subst;
    elaboratedElements.push(result.elaborated);

    try {
      subst = unify(elemType, result.type, subst);
    } catch (e) {
      // Continue
    }
  }

  return {
    type: applySubst(subst, typeApp(typeConst('Array'), elemType)),
    subst,
    elaborated: {
      ...expr,
      elements: elaboratedElements
    }
  };
}

function inferFieldAccess(ctx: Context, expr: AST.FieldAccessExpr, subst: Subst): InferResult {
  const objResult = infer(ctx, expr.object, subst);
  subst = objResult.subst;

  // Simplified: return a fresh meta for field access
  const resultType = freshMeta(expr.field);

  return {
    type: applySubst(subst, resultType),
    subst,
    elaborated: expr
  };
}

function inferProj(ctx: Context, expr: AST.ProjExpr, subst: Subst): InferResult {
  const objResult = infer(ctx, expr.expr, subst);
  subst = objResult.subst;

  // Simplified: return a fresh meta for projection
  const resultType = freshMeta(`proj${expr.index}`);

  return {
    type: applySubst(subst, resultType),
    subst,
    elaborated: expr
  };
}

function inferDo(ctx: Context, expr: AST.DoExpr, subst: Subst): InferResult {
  let currentCtx = ctx;
  let lastType: Type = typeConst('Unit');
  let elaboratedStmts: AST.DoStatement[] = [];

  for (const stmt of expr.statements) {
    switch (stmt.kind) {
      case 'let':
        const letValueResult = infer(currentCtx, stmt.value, subst);
        subst = letValueResult.subst;
        currentCtx = extendContext(currentCtx, stmt.name, letValueResult.type);
        elaboratedStmts.push({ ...stmt, value: letValueResult.elaborated });
        lastType = letValueResult.type;
        break;

      case 'bind':
        const bindResult = infer(currentCtx, stmt.expr, subst);
        subst = bindResult.subst;
        // Simplified: assume bind returns the type
        currentCtx = extendContext(currentCtx, stmt.name, bindResult.type);
        elaboratedStmts.push({ ...stmt, expr: bindResult.elaborated });
        lastType = bindResult.type;
        break;

      case 'doExpr':
        const exprResult = infer(currentCtx, stmt.expr, subst);
        subst = exprResult.subst;
        elaboratedStmts.push({ kind: 'doExpr', expr: exprResult.elaborated });
        lastType = exprResult.type;
        break;

      case 'return':
        const retResult = infer(currentCtx, stmt.expr, subst);
        return {
          type: retResult.type,
          subst: retResult.subst,
          elaborated: {
            ...expr,
            statements: elaboratedStmts.concat({ ...stmt, expr: retResult.elaborated })
          }
        };
    }
  }

  return {
    type: lastType,
    subst,
    elaborated: { ...expr, statements: elaboratedStmts }
  };
}

function inferExists(ctx: Context, expr: AST.ExistsExpr, subst: Subst): InferResult {
  let currentCtx = ctx;
  let elaboratedParams: AST.Binder[] = [];

  for (const param of expr.params) {
    let paramType: Type;
    if (param.type) {
      const typeResult = infer(ctx, param.type, subst);
      paramType = typeResult.type;
      subst = typeResult.subst;
    } else {
      paramType = freshMeta(param.name);
    }
    elaboratedParams.push({ ...param, type: typeToExpr(paramType) });
    currentCtx = extendContext(currentCtx, param.name, paramType);
  }

  const bodyResult = infer(currentCtx, expr.body, subst);
  subst = bodyResult.subst;

  return {
    type: sortType(0), // Exists returns Prop
    subst,
    elaborated: {
      ...expr,
      params: elaboratedParams,
      body: bodyResult.elaborated
    }
  };
}

// Convert Type to AST.Expr
function typeToExpr(type: Type): AST.Expr {
  switch (type.kind) {
    case 'typeVar':
      return { kind: 'ident', name: type.name };
    case 'typeConst':
      return { kind: 'ident', name: type.name };
    case 'typeApp':
      return {
        kind: 'app',
        fn: typeToExpr(type.fn),
        arg: typeToExpr(type.arg),
        explicit: true
      };
    case 'piType':
      return {
        kind: 'pi',
        params: [{ name: type.name, type: typeToExpr(type.domain), implicit: type.implicit, instImplicit: false, strictImplicit: false }],
        body: typeToExpr(type.codomain)
      };
    case 'univType':
      return { kind: 'type', level: type.level };
    case 'sortType':
      return { kind: 'sort', level: type.level };
    case 'propType':
      return { kind: 'prop' };
    case 'metaVar':
      return { kind: 'hole', name: type.name || `?${type.id}` };
    case 'sigmaType':
      return { kind: 'ident', name: 'Sigma' };
  }
}

// Elaborate a module
export interface ElabModuleResult {
  elaborated: AST.Module;
  types: Map<string, Type>;
  subst: Subst;
}

export function elaborateModule(module: AST.Module): ElabModuleResult {
  let ctx = emptyContext();
  let subst: Subst = new Map();
  const types = new Map<string, Type>();
  const elaboratedDecls: AST.Decl[] = [];

  for (const decl of module.decls) {
    switch (decl.kind) {
      case 'def':
        const result = infer(ctx, decl.value, subst);
        subst = result.subst;

        let defType = result.type;
        if (decl.type) {
          const typeResult = infer(ctx, decl.type, subst);
          subst = typeResult.subst;
          try {
            subst = unify(defType, typeResult.type, subst);
          } catch (e) {
            // Continue
          }
          defType = typeResult.type;
        }

        ctx = extendContext(ctx, decl.name, defType);
        types.set(decl.name, applySubst(subst, defType));

        elaboratedDecls.push({
          ...decl,
          value: result.elaborated,
          type: typeToExpr(applySubst(subst, defType))
        });
        break;

      case 'theorem':
        const proofResult = infer(ctx, decl.proof, subst);
        subst = proofResult.subst;

        const theoremTypeResult = infer(ctx, decl.type, subst);
        subst = theoremTypeResult.subst;

        ctx = extendContext(ctx, decl.name, theoremTypeResult.type);
        types.set(decl.name, applySubst(subst, theoremTypeResult.type));

        elaboratedDecls.push({
          ...decl,
          proof: proofResult.elaborated,
          type: typeToExpr(applySubst(subst, theoremTypeResult.type))
        });
        break;

      case 'axiom':
      case 'constant':
        const axTypeResult = infer(ctx, decl.type, subst);
        subst = axTypeResult.subst;

        ctx = extendContext(ctx, decl.name, axTypeResult.type);
        types.set(decl.name, applySubst(subst, axTypeResult.type));

        elaboratedDecls.push(decl);
        break;

      case 'inductive':
        // Register inductive type
        ctx = extendContext(ctx, decl.name, sortType(0));
        types.set(decl.name, sortType(0));

        // Register constructors
        for (const ctor of decl.ctors) {
          let ctorType: Type = typeConst(decl.name);
          if (ctor.type) {
            const ctorTypeResult = infer(ctx, ctor.type, subst);
            ctorType = ctorTypeResult.type;
            subst = ctorTypeResult.subst;
          }
          ctx = extendContext(ctx, ctor.name, ctorType);
          types.set(ctor.name, applySubst(subst, ctorType));
        }

        elaboratedDecls.push(decl);
        break;

      case 'variable':
        if (decl.type) {
          const varTypeResult = infer(ctx, decl.type, subst);
          subst = varTypeResult.subst;
          ctx = extendContext(ctx, decl.name, varTypeResult.type);
          types.set(decl.name, applySubst(subst, varTypeResult.type));
        }
        elaboratedDecls.push(decl);
        break;

      case 'namespace':
        // Process namespace
        const nsResult = elaborateModule({ kind: 'module', decls: decl.decls });
        for (const [name, type] of nsResult.types) {
          ctx = extendContext(ctx, `${decl.name}.${name}`, type);
          types.set(`${decl.name}.${name}`, type);
        }
        elaboratedDecls.push({
          ...decl,
          decls: nsResult.elaborated.decls
        });
        break;

      default:
        elaboratedDecls.push(decl);
    }
  }

  return {
    elaborated: { kind: 'module', decls: elaboratedDecls },
    types,
    subst
  };
}
