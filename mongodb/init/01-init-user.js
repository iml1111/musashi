// MongoDB 초기화 스크립트 - 사용자 및 권한 설정
// 이 스크립트는 컨테이너 시작시 자동으로 실행됩니다

// 환경 변수에서 데이터베이스 이름 가져오기
const dbName = process.env.MONGO_INITDB_DATABASE || 'musashi';

// musashi 데이터베이스로 전환
db = db.getSiblingDB(dbName);

// 개발용 사용자 생성 (프로덕션에서는 보안을 위해 수정 필요)
if (process.env.MONGO_ROOT_USERNAME && process.env.MONGO_ROOT_PASSWORD) {
    // 관리자 계정이 설정된 경우 애플리케이션 전용 사용자 생성
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

// 기본 컬렉션 생성 및 인덱스 설정
try {
    // users 컬렉션 생성 및 인덱스 설정
    db.createCollection("users");
    
    // 사용자 이메일에 유니크 인덱스 생성
    db.users.createIndex(
        { "email": 1 }, 
        { 
            unique: true,
            name: "email_unique_index",
            background: true
        }
    );
    
    // 사용자 이름에 인덱스 생성
    db.users.createIndex(
        { "username": 1 },
        {
            name: "username_index",
            background: true
        }
    );
    
    // 생성 시간 인덱스 (TTL 가능)
    db.users.createIndex(
        { "created_at": 1 },
        {
            name: "created_at_index",
            background: true
        }
    );
    
    print(`✅ Collection 'users' created with indexes`);
    
    // workflows 컬렉션 생성 및 인덱스 설정
    db.createCollection("workflows");
    
    // 워크플로우 소유자 인덱스
    db.workflows.createIndex(
        { "owner_id": 1 },
        {
            name: "owner_id_index",
            background: true
        }
    );
    
    // 팀 ID 인덱스
    db.workflows.createIndex(
        { "team_id": 1 },
        {
            name: "team_id_index",
            background: true
        }
    );
    
    // 워크플로우 이름 텍스트 검색 인덱스
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
    
    // 생성/수정 시간 복합 인덱스
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
    
    // 공유 토큰 인덱스 (유니크)
    db.workflows.createIndex(
        { "share_token": 1 },
        {
            unique: true,
            sparse: true, // null 값 허용
            name: "share_token_unique_index",
            background: true
        }
    );
    
    print(`✅ Collection 'workflows' created with indexes`);
    
    // 개발 환경용 샘플 데이터 삽입
    if (process.env.ENVIRONMENT === 'development') {
        // 테스트 사용자 생성
        const testUser = {
            _id: ObjectId(),
            email: "test@musashi.dev",
            username: "testuser",
            hashed_password: "$2b$12$example.hash", // 실제로는 해시된 비밀번호
            roles: ["user"],
            created_at: new Date(),
            updated_at: new Date(),
            is_active: true
        };
        
        db.users.insertOne(testUser);
        print(`✅ Development test user created: ${testUser.email}`);
        
        // 테스트 워크플로우 생성
        const testWorkflow = {
            _id: ObjectId(),
            name: "Sample Workflow",
            description: "A sample workflow for development testing",
            owner_id: testUser._id,
            team_id: null,
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
    
    // 데이터베이스 상태 확인
    const stats = db.stats();
    print(`📊 Database '${dbName}' initialized successfully:`);
    print(`   - Collections: ${stats.collections}`);
    print(`   - Indexes: ${stats.indexes}`);
    print(`   - Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    
} catch (error) {
    print(`❌ Initialization error: ${error}`);
}