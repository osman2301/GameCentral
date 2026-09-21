<?php
$host = 'localhost';
$dbname = 'library';
$username = 'root';
$password = '';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
    exit;
}

if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    header('Content-Type: application/json');

    $method = $_SERVER['REQUEST_METHOD'];

    // GET: fetch saved games
    if ($method === 'GET') {
        $result = $conn->query('SELECT id, title, platform FROM game');

        if (!$result) {
            http_response_code(500);
            echo json_encode(['error' => $conn->error]);
            exit;
        }

        $games = [];
        while ($row = $result->fetch_assoc()) {
            $games[] = $row;
        }

        echo json_encode($games);
        exit;
    }

    // POST: insert new game
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $title = trim($data['title'] ?? '');
        $platform = trim($data['platform'] ?? '');

        if ($title === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required']);
            exit;
        }

        $stmt = $conn->prepare('INSERT INTO game (title, platform) VALUES (?, ?)');

        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['error' => $conn->error]);
            exit;
        }

        $stmt->bind_param('ss', $title, $platform);

        if (!$stmt->execute()) {
            http_response_code(500);
            echo json_encode(['error' => $stmt->error]);
            exit;
        }

        http_response_code(201);
        echo json_encode([
            'id' => $conn->insert_id,
            'title' => $title,
            'platform' => $platform
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}