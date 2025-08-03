from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


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


class WorkflowInDB(WorkflowBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    owner_id: str
    team_id: Optional[str] = None
    version: int = 1
    is_public: bool = False
    share_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Workflow(WorkflowInDB):
    pass