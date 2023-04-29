import { computed, makeObservable, obx, action } from '@firefly/auto-editor-core';
import { NodeData, isJSExpression, isDOMText, NodeSchema, isNodeSchema, RootSchema, PageSchema, ComponentsMap } from '@alilc/lowcode-types';
import { EventEmitter } from 'events';
import { Project } from '../project';
import { ISimulatorHost } from '../simulator';
// import { ComponentMeta } from '../component-meta';
import { Node } from './node/node';
import { Selection } from './selection';
// import { History } from './history';
// import { TransformStage, ModalNodesManager } from './node';
import { uniqueId, isPlainObject, compatStage } from '@alilc/lowcode-utils';
import { isDragNodeDataObject, DragNodeObject, DragNodeDataObject, DropLocation, Designer } from '../designer';


export type GetDataType<T, NodeType> = T extends undefined
  ? NodeType extends {
    schema: infer R;
  }
    ? R
    : any
  : T;

export class DocumentModel {
  /**
   * 文档编号
   */
  id: string = uniqueId('doc');

  /**
   * 选区控制
   */
  readonly selection: Selection = new Selection(this);

  /**
   * 操作记录控制
   */
  readonly history: History;

  /**
   * 模态节点管理
   */
//   readonly modalNodesManager: ModalNodesManager;

  private _nodesMap = new Map<string, Node>();

  readonly project: Project;

  readonly designer: Designer;

  @obx.shallow private nodes = new Set<Node>();

  private seqId = 0;

  private emitter: EventEmitter;

  private rootNodeVisitorMap: { [visitorName: string]: any } = {};

  /**
   * @deprecated
   */
  private _addons: Array<{ name: string; exportData: any }> = [];
  @obx.ref private _opened = false;

  @obx.ref private _suspensed = false;
  /**
   * 是否为非激活状态
   */
   get suspensed(): boolean {
    return this._suspensed || !this._opened;
  }

  /**
   * 与 suspensed 相反，是否为激活状态，这个函数可能用的更多一点
   */
  get active(): boolean {
    return !this._suspensed;
  }

  /**
   * @deprecated 兼容
   */
  get actived(): boolean {
    return this.active;
  }

  /**
   * 模拟器
   */
  get simulator(): ISimulatorHost | null {
    return this.project.simulator;
  }

  get nodesMap(): Map<string, Node> {
    return this._nodesMap;
  }

  constructor(project: Project, schema?: RootSchema) {
    makeObservable(this);
    this.project = project;
    this.designer = this.project?.designer;
    this.emitter = new EventEmitter();
  }

  open(): DocumentModel {
    const originState = this._opened;
    this._opened = true;

    return this;
  }

  createNode<T extends Node = Node, C = undefined>(data: GetDataType<C, T>, checkId: boolean = true): T {
    let schema: any;
    let node: Node | null = null;
    schema = data;

    node = new Node(this, schema);
    this._nodesMap.set(node.id, node);
    this.nodes.add(node);
    return node as any;
  }


  /**
   * 根据 id 获取节点
   */
   getNode(id: string): Node | null {
    return this._nodesMap.get(id) || null;
  }
  @obx.ref private _dropLocation: DropLocation | null = null;

   /**
   * 内部方法，请勿调用
   */
    internalSetDropLocation(loc: DropLocation | null) {
      this._dropLocation = loc;
    }
}

export function isDocumentModel(obj: any): obj is DocumentModel {
  return obj && obj.rootNode;
}

export function isPageSchema(obj: any): obj is PageSchema {
  return obj?.componentName === 'Page';
}
