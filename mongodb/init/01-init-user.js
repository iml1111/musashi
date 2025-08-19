// MongoDB Second기화 Script - User 및 Permission Settings
// 이 Script는 Container StartHour Auto으로 Execute됩니다

// Environment Variables에서 Database Name Import
const dbName = process.env.MONGO_INITDB_DATABASE || 'musashi';

// musashi Database로 전환
db = db.getSiblingDB(dbName);

// Development용 User Create (Production에서는 Security을 위해 Modify 필요)
if (process.env.MONGO_ROOT_USERNAME && process.env.MONGO_ROOT_PASSWORD) {
    // Management자 계정이 Settings된 경우 애플리케이션 전용 User Create
    try {
        db.createUser({
            user: "musashi_app",
            pwd: process.env.MONGO_APP_PASSWORD || "musashi_app_password",
            roles: [
                {
                    role: "readWrite",
                    db: dbName
                },
                {
                    role: "dbAdmin",
                    db: dbName
                }
            ]
        });
        print(`✅ Application user 'musashi_app' created for database '${dbName}'`);
    } catch (error) {
        print(`⚠️  User creation failed: ${error}`);
    }
} else {
    print(`ℹ️  Running in development mode - no authentication required`);
}

// Default 컬렉션 Create 및 인덱스 Settings
try {
    // users 컬렉션 Create 및 인덱스 Settings
    db.createCollection("users");
    
    // User 이메Day에 유니크 인덱스 Create
    db.users.createIndex(
        { "email": 1 }, 
        { 
            unique: true,
            name: "email_unique_index",
            background: true
        }
    );
    
    // User Name에 인덱스 Create
    db.users.createIndex(
        { "username": 1 },
        {
            name: "username_index",
            background: true
        }
    );
    
    // Create Time 인덱스 (TTL 가능)
    db.users.createIndex(
        { "created_at": 1 },
        {
            name: "created_at_index",
            background: true
        }
    );
    
    print(`✅ Collection 'users' created with indexes`);
    
    // workflows 컬렉션 Create 및 인덱스 Settings
    db.createCollection("workflows");
    
    // 워크플로우 소유자 인덱스
    db.workflows.createIndex(
        { "owner_id": 1 },
        {
            name: "owner_id_index",
            background: true
        }
    );
    
    
    // 워크플로우 Name 텍스트 Search 인덱스
    db.workflows.createIndex(
        { 
            "name": "text", 
            "description": "text" 
        },
        {
            name: "workflow_text_search",
            background: true
        }
    );
    
    // Create/Modify Time 복합 인덱스
    db.workflows.createIndex(
        { 
            "created_at": -1,
            "updated_at": -1 
        },
        {
            name: "timestamps_index",
            background: true
        }
    );
    
    // 공유 Token 인덱스 (유니크)
    db.workflows.createIndex(
        { "share_token": 1 },
        {
            unique: true,
            sparse: true, // null Value Allow
            name: "share_token_unique_index",
            background: true
        }
    );
    
    print(`✅ Collection 'workflows' created with indexes`);
    
    // Development Environment용 샘플 Data 삽입
    if (process.env.ENVIRONMENT === 'development') {
        // Testing User Create
        const testUser = {
            _id: ObjectId(),
            email: "test@musashi.dev",
            username: "testuser",
            hashed_password: "$2b$12$example.hash", // 실제로는 해Hour된 비밀Number
            roles: ["user"],
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true
        };
        
        db.users.insertOne(testUser);
        print(`✅ Development test user created: ${testUser.email}`);
        
        // Testing Create Workflow
        const testWorkflow = {
            _id: ObjectId(),
            name: "Sample Workflow",
            description: "A sample workflow for development testing",
            owner_id: testUser._id,
            nodes: [
                {
                    id: "node_1",
                    type: "start",
                    label: "Start",
                    position: { x: 100, y: 100 },
                    properties: {}
                },
                {
                    id: "node_2", 
                    type: "action",
                    label: "Process Data",
                    position: { x: 300, y: 100 },
                    properties: {
                        action_type: "process",
                        parameters: {}
                    }
                },
                {
                    id: "node_3",
                    type: "end", 
                    label: "End",
                    position: { x: 500, y: 100 },
                    properties: {}
                }
            ],
            edges: [
                {
                    id: "edge_1",
                    source: "node_1",
                    target: "node_2",
                    label: ""
                },
                {
                    id: "edge_2", 
                    source: "node_2",
                    target: "node_3",
                    label: ""
                }
            ],
            version: 1,
            created_at: new Date(),
            updated_at: new Date(),
            is_public: false
        };
        
        db.workflows.insertOne(testWorkflow);
        print(`✅ Development test workflow created: ${testWorkflow.name}`);
    }
    
    // Database Status Confirm
    const stats = db.stats();
    print(`📊 Database '${dbName}' initialized successfully:`);
    print(`   - Collections: ${stats.collections}`);
    print(`   - Indexes: ${stats.indexes}`);
    print(`   - Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    
} catch (error) {
    print(`❌ Initialization error: ${error}`);
}