# Ameefar Frontend API Integration Guide

This guide details the API endpoints, methods, and expected payload structures for integrating the **Content (Recycling News)** and **Chatbot** modules into the Ameefar frontend (React/Next.js/etc.). 

All API responses follow a consistent envelope structure from the backend core utilities:
```json
{
  "success": true,
  "message": "OK",
  "data": { ... } // or array for lists
}
```

---

## 1. Recycling News Endpoints

The news feed is public and designed to showcase platform activity. Base path: `/api/content/`

### 1.1 Featured News (Landing Page)
Ideal for the main landing page hero or carousel section.
- **URL**: `GET /api/content/recycling/news/featured/`
- **Method**: `GET`
- **Auth Required**: No
- **Response Structure**:
  ```json
  {
    "success": true,
    "message": "OK",
    "data": [
      {
        "id": "uuid",
        "slug": "article-slug",
        "title": "Article Title",
        "url": "https://external-news-source.com/article",
        "source": "Source Name",
        "snippet": "Short summary of the article...",
        "image_url": "https://...",
        "has_image": true,
        "category": "plastic",
        "category_display": "Plastics",
        "is_featured": true,
        "read_time": 3,
        "published_at": "2026-07-31T10:00:00Z",
        "time_ago": "3 hours ago"
      }
    ]
  }
  ```

### 1.2 Paginated News List
For the main news/blog listing page.
- **URL**: `GET /api/content/recycling/news/`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `page` (int) - Page number (default 1)
  - `page_size` (int) - Items per page (default 20, max 100)
  - `category` (string) - Filter by category enum (e.g., `plastic`, `africa`)
  - `search` (string) - Text search in title/snippet
  - `featured` (boolean) - `true` to filter only featured
  - `source_type` (string) - `google_news` or `newsdata`
- **Response Structure**: Uses standard paginated envelope:
  ```json
  {
    "success": true,
    "pagination": {
      "count": 142,
      "total_pages": 8,
      "current_page": 1,
      "next": "http://api/...?page=2",
      "previous": null
    },
    "results": [ /* Same article objects as featured endpoint */ ]
  }
  ```

### 1.3 News Stats & Activity
Great for a "Platform Activity" section on the frontend showing the platform is active.
- **URL**: `GET /api/content/recycling/news/stats/`
- **Method**: `GET`
- **Auth Required**: No
- **Response Structure**:
  ```json
  {
    "success": true,
    "message": "OK",
    "data": {
      "total_articles": 150,
      "featured_articles": 6,
      "categories": { "plastic": 45, "africa": 20 },
      "sources": { "google_news": 120, "newsdata": 30 },
      "latest_fetch": "2026-07-31T10:45:00Z",
      "newest_article": "2026-07-31T09:30:00Z"
    }
  }
  ```

### 1.4 News Categories
Use this to render filter pills dynamically with article counts.
- **URL**: `GET /api/content/recycling/news/categories/`
- **Method**: `GET`
- **Auth Required**: No
- **Response Structure**:
  ```json
  {
    "success": true,
    "message": "OK",
    "data": [
      { "value": "general", "label": "General", "count": 12 },
      { "value": "plastic", "label": "Plastics", "count": 45 }
    ]
  }
  ```

### 1.5 Single Article Detail
For rendering an individual article view.
- **URL**: `GET /api/content/recycling/news/<slug>/`
- **Method**: `GET`
- **Auth Required**: No
- **Response Structure**: Returns full article object (same as list, but includes full snippet length and `source_type_display`).

### 1.6 Admin Fetch Trigger (Optional)
If building a custom admin dashboard on the frontend.
- **URL**: `POST /api/content/recycling/news/fetch/`
- **Method**: `POST`
- **Auth Required**: Yes (Admin Token)
- **Response Structure**: `202 Accepted` (task runs asynchronously).

---

## 2. Chatbot Endpoint

The chatbot endpoint handles conversational interactions, utilizing a standard messages array format similar to the OpenAI API standard.

### 2.1 Chat API
- **URL**: `POST /api/chatbot/`
- **Method**: `POST`
- **Auth Required**: Can be used authenticated or unauthenticated depending on view configuration, but usually uses Bearer token if context is needed.
- **Request Body**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Tell me about plastic recycling rates in Ghana"
      },
      {
        "role": "assistant",
        "content": "In Ghana, plastic recycling..."
      }
    ],
    "userContext": {
      "location": "Accra",
      "role": "buyer"
    }
  }
  ```
- **Payload Properties**:
  - `messages` (Array, required): History of the conversation.
    - `role` (enum): `"system"`, `"user"`, `"assistant"`, `"tool"`
    - `content` (string): Message text (optional for tool calls).
    - `name` (string): Optional name for tool calls/system messages.
    - `tool_call_id` (string): Optional, ID of tool call being responded to.
    - `tool_calls` (Array): Optional, for assistant tool requests.
  - `userContext` (Object, optional): Any additional context the frontend wants to pass to the bot (e.g., current page, user preferences).
- **Response Structure**:
  Typically returns a streaming or JSON response containing the assistant's reply (depends on exact implementation in `ChatbotAPIView`). If JSON, usually takes the form:
  ```json
  {
    "success": true,
    "data": {
      "role": "assistant",
      "content": "The recycling rate..."
    }
  }
  ```

---

## Integration Tips for Frontend Developers

> [!TIP]
> **Performance**
> The `featured` and `stats` endpoints are very fast (small payloads). Call these immediately on page load for the landing page to make it feel instantly active.

> [!NOTE]
> **Timestamps**
> Don't compute "X minutes ago" on the frontend unless you want live updating. The backend automatically returns a pre-computed `time_ago` string (e.g., "3 hours ago") for every article for convenience.

> [!IMPORTANT]
> **Error Handling**
> If any API request fails (400, 401, 404, 500), the backend consistently returns this shape:
> ```json
> {
>   "success": false,
>   "error": {
>     "code": "error_code",
>     "message": "Human readable message",
>     "detail": { /* Form field specific errors if 400 Bad Request */ }
>   }
> }
> ```
