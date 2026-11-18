using System.Net.Http.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FlutterClient", policy =>
        policy.WithOrigins(
                "http://localhost",
                "http://localhost:3000",
                "http://localhost:8080")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddHttpClient();

var app = builder.Build();

app.UseCors("FlutterClient");

app.MapGet("/api/status", () =>
{
    var nextAppUrl = builder.Configuration["NEXT_APP_BASE_URL"] ?? "http://localhost:3000";
    return Results.Ok(new
    {
        service = "Paper Explainer .NET API",
        status = "running",
        nextAppUrl,
    });
});

app.MapPost("/api/chat", async (
    HttpRequest request,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration) =>
{
    var nextAppUrl = (configuration["NEXT_APP_BASE_URL"] ?? "http://localhost:3000").TrimEnd('/');
    var payload = await request.ReadFromJsonAsync<object>();
    if (payload is null)
    {
        return Results.BadRequest(new { error = "A chat request is required." });
    }

    var client = httpClientFactory.CreateClient();
    using var response = await client.PostAsJsonAsync($"{nextAppUrl}/api/chat", payload);
    var body = await response.Content.ReadAsStringAsync();
    return Results.Content(body, "application/json", statusCode: (int)response.StatusCode);
});

app.Run();
