from datetime import date
import os
from azure.cosmos import CosmosClient
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

from models import FeedbackItem, HistoryItem

class CosmosManager:
    def __init__(self):
        load_dotenv()
        self.uri = os.getenv('COSMOSDB_URI')
        self.key = os.getenv('COSMOSDB_KEY')
        self.database_name = os.getenv('COSMOSDB_DATABASE')
        self.feedback_container_name = os.getenv('COSMOSDB_FEEDBACK_CONTAINER')
        self.history_container_name = os.getenv('COSMOSDB_HISTORY_CONTAINER')

        missing = []
        if not self.uri:
            missing.append('COSMOSDB_URI')
        if not self.database_name:
            missing.append('COSMOSDB_DATABASE')
        if not self.feedback_container_name:
            missing.append('COSMOSDB_FEEDBACK_CONTAINER')
        if not self.history_container_name:
            missing.append('COSMOSDB_HISTORY_CONTAINER')
        if missing:
            raise ValueError(f"Missing required Cosmos DB environment variables: {', '.join(missing)}")

        credential = DefaultAzureCredential()
        self.client = CosmosClient(self.uri, credential=credential)
        self.database = self.client.get_database_client(self.database_name)
        self.feedback_container = self.database.get_container_client(self.feedback_container_name)
        self.history_container = self.database.get_container_client(self.history_container_name)

    def get_feedback_users(self):
        query = "SELECT DISTINCT c.entra_oid FROM c WHERE c.type = 'message_pair'"
        user_items = list(self.feedback_container.query_items(query=query, enable_cross_partition_query=True))
        return [item.get("entra_oid") for item in user_items if item.get("entra_oid")]

    def get_feedback_items(self, user: str = None, type: str = None, start_date: int = None, end_date: int = None):
        if type:
            query_with_type = f" AND c.response.feedback.type = '{type}'"
        if start_date:
            query_with_date = f" AND (c._ts > {(start_date/1000)} AND c._ts < {(end_date/1000)})"
        else:
            query_with_date = ""
        if user:
            query = f"SELECT * FROM c WHERE c.type = 'message_pair' AND c.entra_oid = '{user}' {query_with_type} {query_with_date} ORDER BY c._ts DESC"
        else:
            query = f"SELECT * FROM c WHERE c.type = 'message_pair' {query_with_type} {query_with_date} ORDER BY c._ts DESC"
        feedback_items = list(self.feedback_container.query_items(query=query, enable_cross_partition_query=True))
        return self.get_feedback_items_from_cosmos(feedback_items)

    def get_feedback_items_from_cosmos(self, feedback_json):
        feedback_list = []
        for item in feedback_json:
            if item.get("type") == "message_pair":
                feedback_obj = FeedbackItem(
                    id=item.get("id"),
                    session_id=item.get("session_id"),
                    entra_oid=item.get("entra_oid"),
                    timestamp=str(item.get("_ts")),
                    question=item.get("question", ""),
                    answer=item.get("response", {}).get("message", {}).get("content", ""),
                    type=item.get("response", {}).get("feedback", {}).get("type", ""),
                    text=item.get("response", {}).get("feedback", {}).get("text", ""),
                )
                thoughts = item["response"]["context"]["thoughts"]
                description = next(
                    (t["description"] for t in thoughts if t.get("title") == "Search using generated search query"),
                    None
                )
                feedback_obj.rewritten_question = description
                feedback_list.append(feedback_obj)
        return feedback_list

    def get_history_users(self):
        query = "SELECT DISTINCT c.entra_oid FROM c WHERE c.type = 'message_pair'"
        user_items = list(self.history_container.query_items(query=query, enable_cross_partition_query=True))
        return [item.get("entra_oid") for item in user_items if item.get("entra_oid")]

    def get_history_items(self, user: str = None, start_date: int = None, end_date: int = None):
        if start_date:
            query_with_date = f" AND (c._ts > {(start_date/1000)} AND c._ts < {(end_date/1000)})"
        else:
            query_with_date = ""
        if user:
            query = f"SELECT * FROM c WHERE c.type = 'message_pair' AND c.entra_oid = '{user}' {query_with_date} ORDER BY c._ts DESC"
        else:
            query = f"SELECT * FROM c WHERE c.type = 'message_pair' {query_with_date} ORDER BY c._ts DESC"
        history_items = list(self.history_container.query_items(query=query, enable_cross_partition_query=True))
        return self.get_history_items_from_cosmos(history_items)

    def get_history_items_from_cosmos(self, history_json):
        history_list = []
        for item in history_json:
            if item.get("type") == "message_pair":
                history_obj = HistoryItem(
                    id=item.get("id"),
                        session_id=item.get("session_id"),
                        entra_oid=item.get("entra_oid"),
                        timestamp=str(item.get("_ts")),
                        question=item.get("question", ""),
                        answer=item.get("response", {}).get("message", {}).get("content", ""),
                    )
                thoughts = item["response"]["context"]["thoughts"]
                description = next(
                    (t["description"] for t in thoughts if t.get("title") == "Search using generated search query"),
                    None
                )
                history_obj.rewritten_question = description
                history_list.append(history_obj)
        return history_list
