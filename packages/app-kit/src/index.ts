/* ============================================================
   @station/app-kit — greenfield 상업 SaaS 제품 UI 키트 (WR-MVP-1).
   design-system(원자) 위의 제품 IA/Shell/Scope/Surface 계층. 전체 일관성의 단일 출처.
   ============================================================ */
export {
  PRODUCTS,
  SURFACES,
  productById,
  surfaceBySws,
  surfacesOf,
  type ProductId,
  type ProductDef,
  type SurfaceDef,
  type Authority,
  type Locus,
  type ControlMode,
  type ScopeDepth,
} from "./product-matrix";
export { ScopeProvider, useScope, ProjectScopePicker, ScopeSummary, type Scope } from "./scope";
export { SurfaceHeader, AuthorityBadge, MirrorBadge, StubPanel } from "./surface";
export { ProductShell, ProductNav, ProductCard, type NavItem } from "./shell";
