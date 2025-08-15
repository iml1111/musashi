from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, GetCoreSchemaHandler, ConfigDict
from pydantic_core import CoreSchema, core_schema
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema(
                [
                    core_schema.is_instance_schema(ObjectId),
                    core_schema.chain_schema(
                        [
                            core_schema.str_schema(),
                            core_schema.no_info_plain_validator_function(cls.validate),
                        ]
                    ),
                ]
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(lambda x: str(x)),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


class Node(BaseModel):
    id: str
    type: str
    label: str
    properties: Dict[str, Any] = {}
    position_x: Optional[float] = None
    position_y: Optional[float] = None


class Edge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    sourceHandle: Optional[str] = None
    data: Optional[Dict[str, Any]] = {}


class UpdateLog(BaseModel):
    username: str
    timestamp: datetime
    version: int


class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: List[Node] = []
    edges: List[Edge] = []
    metadata: Dict[str, Any] = {}


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[Node]] = None
    edges: Optional[List[Edge]] = None
    metadata: Optional[Dict[str, Any]] = None
    version: Optional[int] = None  # For optimistic locking


class WorkflowInDB(WorkflowBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    owner_id: str
    team_id: Optional[str] = None
    version: int = 1
    is_public: bool = False
    share_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_modified_by: Optional[str] = None  # Track who made the last change
    currently_editing: Optional[List[str]] = []  # Track active editors
    update_logs: List[UpdateLog] = []  # Track update history (max 50 entries)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        use_alias_generator=False,
    )


class Workflow(WorkflowInDB):
    pass

